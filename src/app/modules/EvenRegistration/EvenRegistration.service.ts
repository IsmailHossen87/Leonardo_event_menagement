import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IEvenRegistration } from './EvenRegistration.interface';
import { EvenRegistration } from './EvenRegistration.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { Event } from '../Event/Event.model';
import mongoose from 'mongoose';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { User } from '../user/user.model';
import { Console } from 'winston/lib/winston/transports';
import generateOTP from '../../../utils/generateOTP';


const createEvenRegistration = async (
     payload: IEvenRegistration,
     user: { id: string; role: USER_ROLES }
): Promise<IEvenRegistration> => {

     // 🔹 Check user
     const isExistUser = await User.isExistUserById(user.id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     const eventId = new mongoose.Types.ObjectId(payload.event);
     const userId = new mongoose.Types.ObjectId(user.id);

     const today = new Date().toISOString().split("T")[0];

     // 🔹 Check event
     const isExistEvent = await Event.findOne({
          _id: eventId,
          isDeleted: false,
          eventStatus: "APPROVED",
          isVisibilityPublic: true,
          eventDate: { $gte: today },
     });

     if (!isExistEvent) {
          throw new AppError(StatusCodes.NOT_FOUND, "Event not found.");
     }

     // 🔹 Check already registered
     const isAlreadyRegistered = await EvenRegistration.findOne({
          event: eventId,
          user: userId,
     });

     if (isAlreadyRegistered) {
          throw new AppError(
               StatusCodes.BAD_REQUEST,
               "You have already registered for this event."
          );
     }

     const session = await mongoose.startSession();

     try {
          session.startTransaction();
          const otp = generateOTP(6)

          // ✅ IMPORTANT: Use array when using session with create
          const [createdRegistration] = await EvenRegistration.create(
               [
                    {
                         ...payload,
                         event: eventId,
                         user: userId,
                         otp: {
                              code: otp,
                              expireAt: new Date(Date.now() + 10 * 60 * 1000),
                         },
                    },
               ],
               { session }
          );

          // 🔹 Increment registration count
          await Event.findByIdAndUpdate(
               eventId,
               { $inc: { registrationCount: 1 } },
               { session }
          );

          await session.commitTransaction();
          session.endSession();

          // 🔹 Send email (after commit)
          const values = {
               name: isExistUser.name,
               event: isExistEvent.eventName,
               qrCode: isExistEvent.eventQRImage,
               email: isExistUser.email,
               otp: otp,
          };

          const template = emailTemplate.eventRegistration(values);
          await emailHelper.sendEmail(template);

          return createdRegistration;

     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
};

// Verify
const verifyEventRegistrationOTP = async (
     registrationId: string,
     inputOtp: number
) => {

     const registration = await EvenRegistration.findById(registrationId);

     if (!registration) {
          throw new AppError(StatusCodes.NOT_FOUND, "Registration not found.");
     }

     if (registration.verified) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Already verified.");
     }


     if (registration.otp?.code !== inputOtp) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Invalid OTP.");
     }

     if (
          registration.otp?.expireAt! < new Date()
     ) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP.");
     }

     registration.verified = true;
     registration.otp = {
          code: null, expireAt: null,
     };

     await registration.save();

     return registration;
};


const getAllEvenRegistrationsForAdmin = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IEvenRegistration[] }> => {
     const queryBuilder = new QueryBuilder(EvenRegistration.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};
const getAllEvenRegistrations = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IEvenRegistration[] }> => {
     const queryBuilder = new QueryBuilder(EvenRegistration.find({ isDeleted: false, verified: true, isProfileVisibleToAttendees: true }).populate('user', 'name image'), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedEvenRegistrations = async (): Promise<IEvenRegistration[]> => {
     const result = await EvenRegistration.find({ isDeleted: false, verified: true, isProfileVisibleToAttendees: true });
     return result;
};

const updateEvenRegistration = async (id: string, payload: Partial<IEvenRegistration>): Promise<IEvenRegistration | null> => {
     const isExist = await EvenRegistration.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'EvenRegistration not found.');
     }
     return await EvenRegistration.findByIdAndUpdate(id, payload, { new: true });
};



const deleteEvenRegistration = async (id: string): Promise<IEvenRegistration | null> => {
     const result = await EvenRegistration.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'EvenRegistration not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteEvenRegistration = async (id: string): Promise<IEvenRegistration | null> => {
     const result = await EvenRegistration.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'EvenRegistration not found.');
     }
     return result;
};

const getEvenRegistrationById = async (id: string) => {
     const isEvent = await Event.findById(id);
     if (!isEvent) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }
     const registerEvent = await EvenRegistration.find({ event: isEvent._id }).populate('user', 'name image link images ');
     return registerEvent
};


// My Registation Event
const myRegistrationEvent = async (user: { id: string; role: USER_ROLES }, query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IEvenRegistration[] }> => {
     const queryBuilder = new QueryBuilder(EvenRegistration.find({ user: user.id }).populate('event', 'eventName eventQRImage eventDate eventLocation'), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};



export const EvenRegistrationService = {
     createEvenRegistration,
     getAllEvenRegistrationsForAdmin,
     getAllEvenRegistrations,
     getAllUnpaginatedEvenRegistrations,
     updateEvenRegistration,
     deleteEvenRegistration,
     hardDeleteEvenRegistration,
     getEvenRegistrationById,
     verifyEventRegistrationOTP,
     myRegistrationEvent,
};
