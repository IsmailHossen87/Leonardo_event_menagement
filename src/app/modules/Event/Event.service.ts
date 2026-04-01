import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IEvent } from './Event.interface';
import { Event, Report } from './Event.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import mongoose from 'mongoose';
import { EPermissionType } from '../rule/rule.interface';
import { RuleService } from '../rule/rule.service';
import { USER_ROLES } from '../../../enums/user';
import { generateQRCode } from '../../../utils/generateQRCode';
import { EvenRegistration } from '../EvenRegistration/EvenRegistration.model';
import generateOTP from '../../../utils/generateOTP';
import { EvenRegistrationService } from '../EvenRegistration/EvenRegistration.service';
import { User } from '../user/user.model';
import { Subscription } from '../subscription/subscription.model';
import { Rule } from '../rule/rule.model';
import { Message, MessageRequest } from '../message/message.model';
import { Chat } from '../chat/chat.model';

const createEvent = async (payload: IEvent, user: { id: string }): Promise<IEvent> => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // ✅ Date validation
          const eventDateTime = new Date(`${payload.eventDate} ${payload.eventStartTime}`);

          if (eventDateTime < new Date()) {
               throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    "Event date and time must be in the future."
               );
          }

          // ✅ Get user
          const userDetails = await User.findById(user.id)
               .select("subscription")
               .session(session);

          if (!userDetails?.subscription) {
               throw new AppError(StatusCodes.NOT_FOUND, "User subscription not found.");
          }

          // ✅ Get subscription
          const subscription = await Subscription.findById(
               userDetails.subscription
          ).session(session);

          if (!subscription) {
               throw new AppError(StatusCodes.NOT_FOUND, "Subscription not found.");
          }

          if (subscription.remainingEventCount <= 0) {
               throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    "Event limit exceeded."
               );
          }

          // ✅ Get rules in parallel
          const [autoApproved, visibilityRule] = await Promise.all([
               Rule.findOne({ permissionType: EPermissionType.IS_AUTO_APPROVE_EVENTS, }).select("permission"),
               Rule.findOne({ permissionType: EPermissionType.IS_VISIBILITY_PUBLIC, }).select("permission"),
          ]);

          // ✅ Create event (NO array, cleaner TS support)
          const event = new Event({
               ...payload,
               eventDateTime,
               createdBy: new mongoose.Types.ObjectId(user.id),
               eventCode: generateOTP(4),
               eventStatus: autoApproved?.permission ? 'APPROVED' : 'PENDING',
               isVisibilityPublic: visibilityRule?.permission ?? false,
          });

          const result = await event.save({ session });

          // ✅ Update subscription
          subscription.remainingEventCount -= 1;
          subscription.usedEventCount += 1;
          subscription.remainingAllowedRefundAmount =
               subscription.remainingEventCount *
               subscription.pricePerEvent;

          await subscription.save({ session });

          // ✅ QR Code
          const qrCode = await generateQRCode(
               result._id.toString(),
               result.eventCode.toString()
          );

          result.eventQRImage = qrCode.qrImagePath;
          await result.save({ session });

          await session.commitTransaction();
          session.endSession();

          return result;
     } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
     }
};
;


const getAllEventsForAdmin = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IEvent[] }> => {
     const queryBuilder = new QueryBuilder(Event.find().populate({
          path: "createdBy",
          select: "name email createAt"
     }), query);
     const result = await queryBuilder.filter().search(['eventName']).sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};


const getAllEvents = async (
     query: Record<string, any>,
     user: any
): Promise<{
     meta: { total: number; page: number; limit: number };
     result: IEvent[];
}> => {
     const { isMyEvents, ...rest } = query;

     const myRegistrations = await EvenRegistration.find({ user: user.id }).select("event");
     const registeredEventIds = myRegistrations.map(reg => reg.event);

     let queryBuilder;
     if (isMyEvents && user.role === USER_ROLES.ORGANIZER) {
          queryBuilder = new QueryBuilder(Event.find({ isDeleted: false, eventStatus: 'APPROVED', isVisibilityPublic: true, createdBy: user.id, _id: { $nin: registeredEventIds } }).populate({ path: 'createdBy', select: 'name  email createAt' }).select("eventName eventType image  eventPosition eventStartTime  createAt eventLocation  eventStartDate").lean(), rest);
     } else {
          queryBuilder = new QueryBuilder(Event.find({ isDeleted: false, eventStatus: 'APPROVED', isVisibilityPublic: true, _id: { $nin: registeredEventIds } }).populate({ path: 'createdBy', select: 'name  email createAt' }).select("eventName eventType image  eventPosition eventStartTime  createAt eventLocation  eventStartDate").lean(), rest);
     }

     let result = await queryBuilder.filter().search(['eventName', 'eventDate', 'eventLocation']).sort().paginate().fields().modelQuery;

     const adminEventLockPermissionRule = await RuleService.getPermissionFromDB(EPermissionType.IS_EXPIRED_EVENTS_AUTO_LOCK);

     if (adminEventLockPermissionRule?.permission) {
          const presentTime = new Date();

          // find expired events
          const expiredEvents = result.filter((event) => event.eventDate && new Date(event.eventDate) < presentTime);

          // update all expired events in DB
          if (expiredEvents.length > 0) {
               await Event.updateMany(
                    {
                         _id: { $in: expiredEvents.map((event) => event._id) },
                    },
                    {
                         $set: { isLockedAfterExpiration: true },
                    },
               );
          }

          // remove locked/expired events from returned result
          result = result.filter((event) => !(event.eventDate && new Date(event.eventDate) < presentTime));
     }

     const meta = await queryBuilder.countTotal();

     return { meta, result };
};

const getAllUnpaginatedEvents = async (): Promise<IEvent[]> => {
     const result = await Event.find({ isDeleted: false, isApproved: true, isVisibilityPublic: true });
     return result;
};

const updateEvent = async (id: string, payload: Partial<IEvent>) => {
     try {
          const isExist = await Event.findById(id);
          if (!isExist) throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');

          const eventDate = payload.eventDate || isExist.eventDate;
          const eventEndDate = payload.eventEndDate || isExist.eventEndDate;
          const eventStartTime = payload.eventStartTime || isExist.eventStartTime;
          const eventEndTime = payload.eventEndTime || isExist.eventEndTime;

          const startDateTime = new Date(`${eventDate}T${eventStartTime}`);
          const endDateTime = new Date(`${eventEndDate}T${eventEndTime}`);

          if (startDateTime < new Date())
               throw new AppError(StatusCodes.BAD_REQUEST, 'Event start date must be in the future.');

          if (endDateTime <= startDateTime)
               throw new AppError(StatusCodes.BAD_REQUEST, 'Event end must be after start.');

          if (payload.revealTime) {
               const revealDateTime = new Date(payload.revealTime);
               if (revealDateTime <= startDateTime || revealDateTime >= endDateTime)
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Reveal time must be between start and end.');
          }

          // Image cleanup
          if (payload.image && isExist.image) unlinkFile(isExist.image);
          if (payload.eventQRImage && isExist.eventQRImage) unlinkFile(isExist.eventQRImage);
          if (isExist.images?.length && payload.images?.length) {
               isExist.images.forEach((img) => unlinkFile(img));
          }

          const updatedEvent = await Event.findByIdAndUpdate(id, payload, { new: true });

          if (!updatedEvent)
               throw new AppError(StatusCodes.NOT_FOUND, 'Event not found for update.');

          return updatedEvent;

     } catch (error) {
          if (payload.image) unlinkFile(payload.image);
          if (payload.eventQRImage) unlinkFile(payload.eventQRImage);
          if (payload.images?.length) payload.images.forEach((img) => unlinkFile(img));

          throw error; // ✅ This ensures frontend sees the error
     }
};

const deleteEvent = async (id: string): Promise<IEvent | null> => {
     const result = await Event.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteEvent = async (id: string): Promise<IEvent | null> => {
     const result = await Event.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }

     if (result.image) {
          unlinkFile(result.image);
     }
     if (result?.eventQRImage) {
          unlinkFile(result?.eventQRImage);
     }
     if (result.images && result.images.length > 0) {
          result.images.forEach((image) => {
               unlinkFile(image);
          });
     }
     return result;
};


// Get Event And Show all Perticipent User ❇️
const getEventById = async (
     id: string,
     user: any,
     query: Record<string, any>
): Promise<any> => {
     const { status } = query;

     const result = await Event.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, "Event not found.");
     }

     // 🔹 Admin auto lock rule
     const adminEventLockPermissionRule =
          await RuleService.getPermissionFromDB(
               EPermissionType.IS_EXPIRED_EVENTS_AUTO_LOCK
          );

     if (
          adminEventLockPermissionRule &&
          adminEventLockPermissionRule.permission
     ) {
          result.isLockedAfterExpiration = true;
          await result.save();
     }

     // 🔹 Check expired
     const presentTime = new Date();
     const isEventPassed = result.eventDate && new Date(result.eventDate) < presentTime;

     if (
          user.role !== USER_ROLES.SUPER_ADMIN &&
          isEventPassed &&
          result.isLockedAfterExpiration
     ) {
          throw new AppError(StatusCodes.FORBIDDEN, "Event is locked");
     }

     const registrationQuery: any = {
          event: result._id,
          verified: true,
          isProfileVisibleToAttendees: true,
     };
     if (status) {
          registrationQuery.status = status;
     }

     const isHost = result.host?.some(h => String(h) === String(user.id));
     const isCreator = String(result.createdBy) === String(user.id);


     // if (!isHost && !isCreator) {
     //      throw new AppError(
     //           StatusCodes.FORBIDDEN,
     //           'You are not authorized to change the registration status for this event.'
     //      );
     // }


     // ✅ Get all registered users with full user info
     const registrations = await EvenRegistration.find(registrationQuery)
          .populate("user", "name image hobbies links gallary bio isMatchOtherUser")
          .lean();
     if (!registrations) {
          throw new AppError(StatusCodes.NOT_FOUND, "Event not found.");
     }

     const myRegistration = registrations.find((item: any) => String(item.user._id) === String(user.id));

     if (
          user.role === USER_ROLES.USER &&
          myRegistration &&
          myRegistration.status === "PENDING"
     ) {
          throw new AppError(
               StatusCodes.FORBIDDEN,
               "Your registration is still pending. You cannot access this event."
          );
     }



     const currentUserId = user.id;
     const registerUser = registrations.length;


     // ❗ Filter out current logged-in user
     const registeredUsers = registrations
          .map((item: any) => item.user)
          .filter((user: any) =>
               String(user._id) !== String(currentUserId)
          );

     return {
          event: result,
          registeredUsers,
          registerUser
     };
};

const getEventGuests = async (id: string, query: Record<string, any>) => {
     const result = await Event.findOne({ _id: new mongoose.Types.ObjectId(id), isDeleted: false, isVisibilityPublic: true });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }
     const eventRegistrations = await EvenRegistrationService.getAllEvenRegistrations({
          event: result._id.toString(),
          fields: 'user',
          ...query,
     });
     return eventRegistrations;
};

const getEventByQr = async (eventId: string) => {
     const result = await Event.findById(eventId).select('eventType image images eventLocation eventDateTime eventDescription isApproved isLocked registrationCount');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }
     const adminEventLockPermissionRule = await RuleService.getPermissionFromDB(EPermissionType.IS_EXPIRED_EVENTS_AUTO_LOCK);
     if (adminEventLockPermissionRule && adminEventLockPermissionRule.permission) {
          result.isLockedAfterExpiration = true;
          await result.save();
     }
     // if eventDateTime < present time
     const presentTime = new Date();
     const isEventPassed = result.eventDate && new Date(result.eventDate) < presentTime;

     if (isEventPassed || result.isLockedAfterExpiration) {
          throw new AppError(StatusCodes.FORBIDDEN, 'Event is passed or locked');
     }

     const guests = await EvenRegistration.find({ event: new mongoose.Types.ObjectId(eventId), isProfileVisibleToAttendees: true })
          .select('user')
          .populate('user', 'name image')
          .limit(6);

     (result as any).guests = guests;

     return result;
};

const reportAgainstEventById = async (eventId: string, reportData: { reason: string }, user: { id: string } | any) => {
     const result = await Event.findOne({ _id: new mongoose.Types.ObjectId(eventId) }).select('eventType totalReport eventStatus image images eventLocation eventDateTime eventDescription isApproved isLocked registrationCount');

     if (!result || (result && result.eventStatus !== 'APPROVED')) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }
     const isUserRegisteredEvent = await EvenRegistration.findOne({
          event: new mongoose.Types.ObjectId(eventId),
          user: new mongoose.Types.ObjectId(user.id),
     });
     if (!isUserRegisteredEvent) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not a guest to this event.');
     }

     // update the reason
     await EvenRegistration.findByIdAndUpdate(isUserRegisteredEvent._id, {
          userReportAgainstEventRegistration: reportData.reason,
     });
     await Event.findByIdAndUpdate(eventId, {
          totalReport: result.totalReport + 1,
     });
     await Report.create({
          eventId: new mongoose.Types.ObjectId(eventId),
          reporter: new mongoose.Types.ObjectId(user.id),
          reportType: "EVENT",
          reason: reportData.reason,
     });
     return isUserRegisteredEvent.userReportAgainstEventRegistration;
};

const messageRequest = async (
     userId: string,
     user: { id: string },
) => {

     const result = await EvenRegistration.findOne({
          user: new mongoose.Types.ObjectId(userId),
     });

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, "Your are not Registered in this event.");
     }
     // find Event and owner
     const event = await Event.findById(result.event);
     if (!event) {
          throw new AppError(StatusCodes.NOT_FOUND, "Event not found.");
     }


     if (result.user.toString() === user.id.toString()) {
          throw new AppError(StatusCodes.FORBIDDEN, "You are not message to yourself.");
     }

     const isMessageRequest = await MessageRequest.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          requestUserId: new mongoose.Types.ObjectId(user.id),
     });

     if (isMessageRequest) {
          throw new AppError(StatusCodes.FORBIDDEN, "You are already message to this user.");
     }

     const createMessage = await MessageRequest.create({
          userId: new mongoose.Types.ObjectId(userId),
          requestUserId: new mongoose.Types.ObjectId(user.id),
     });

     // check both side request
     const checkMessegeRequest = await MessageRequest.find({
          $or: [
               {
                    userId: new mongoose.Types.ObjectId(userId),
                    requestUserId: new mongoose.Types.ObjectId(user.id),
               },
               {
                    userId: new mongoose.Types.ObjectId(user.id),
                    requestUserId: new mongoose.Types.ObjectId(userId),
               },
          ],
     });

     // only create chat if both requested
     if (checkMessegeRequest.length >= 2) {

          const existingChat = await Chat.findOne({
               eventId: result.event,
               participants: {
                    $all: [
                         new mongoose.Types.ObjectId(userId),
                         new mongoose.Types.ObjectId(user.id),
                    ],
               },
          });

          if (!existingChat) {
               await Chat.create({
                    participants: [
                         new mongoose.Types.ObjectId(userId),
                         new mongoose.Types.ObjectId(user.id),
                    ],
                    eventId: result.event,
                    ownerParticipant: new mongoose.Types.ObjectId(event.createdBy),
               });
          }
     }

     return createMessage;
};

const hostRequest = async (eventId: string, user: { id: string; role: USER_ROLES }, userId: string) => {
     const isExist = await EvenRegistration.findOne({ event: eventId, user: userId });
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'EvenRegistration not found.');
     }
     if (isExist.isHostRequest) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are already host request.');
     }
     // await Event.findByIdAndUpdate(eventId, { host: userId }, { new: true });
     return await EvenRegistration.findOneAndUpdate({ event: eventId, user: userId }, { hostRequestStatus: 'PENDING' }, { new: true });
};

const RegistrationStatus = async (
     userId: string,
     eventId: string,
     status: string,
     user: { id: string; role: USER_ROLES }
) => {
     // 🔹 Check event
     const event = await Event.findById(eventId);
     if (!event) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     }

     // 🔹 Permission check
     const isHost = event.host?.some(h => String(h) === String(user.id));
     const isCreator = String(event.createdBy) === String(user.id);
     const isAdmin = user.role === USER_ROLES.SUPER_ADMIN;

     if (!isHost && !isCreator && !isAdmin) {
          throw new AppError(
               StatusCodes.FORBIDDEN,
               'You are not authorized to change the registration status for this event.'
          );
     }

     // 🔹 Check registration exist
     const isExist = await EvenRegistration.findOne({
          event: eventId,
          user: userId,
     });

     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Registration not found.');
     }

     // 🔥 Validate status
     const allowedStatus = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'];

     if (!allowedStatus.includes(status)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid status value.');
     }

     // ✅ Direct update (NO toggle)
     const updated = await EvenRegistration.findOneAndUpdate(
          { event: eventId, user: userId },
          { status },
          { new: true }
     );

     return updated;
};

const sendMessage = async (userId: string, eventId: string, message: string, user: { id: string; role: USER_ROLES }) => {
     const isExist = await EvenRegistration.findOne({ event: eventId, user: userId });
     const event = await Event.findById(eventId);
     if (!event) throw new AppError(StatusCodes.NOT_FOUND, 'Event not found.');
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'EvenRegistration not found.');
     }

     const host = event.host?.some(h => String(h) === String(user.id));
     const isCreator = String(event.createdBy) === String(user.id);
     if (!host && !isCreator) {
          throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to send message to this event.');
     }

     // await Event.findByIdAndUpdate(eventId, { host: userId }, { new: true });
     return await User.findByIdAndUpdate(userId, { message }, { new: true });
};

export const EventService = {
     createEvent,
     getAllEvents,
     getEventGuests,
     getAllEventsForAdmin,
     getAllUnpaginatedEvents,
     updateEvent,
     deleteEvent,
     hardDeleteEvent,
     getEventById,
     getEventByQr,
     reportAgainstEventById,
     messageRequest,
     hostRequest,
     RegistrationStatus,
     sendMessage,
};

