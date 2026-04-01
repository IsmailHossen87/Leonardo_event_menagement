import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { Event } from '../Event/Event.model';
import { IEvent } from '../Event/Event.interface';

const createAdminToDB = async (payload: IUser): Promise<IUser> => {
     const createAdmin: any = await User.create(payload);
     if (!createAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
     }
     if (createAdmin) {
          await User.findByIdAndUpdate({ _id: createAdmin?._id }, { verified: true }, { new: true });
     }
     return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
     const isExistAdmin = await User.findByIdAndDelete(id);
     if (!isExistAdmin) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
     }
     return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
     const admins = await User.find({ role: 'ADMIN' }).select('name email profile contact location');
     return admins;
};

const eventsActionFromDB = async (id: any, reason: string): Promise<IEvent | undefined> => {
     const isExistEvent = await Event.findById(id);
     if (!isExistEvent) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to find Event');
     }
     if (reason) {
          const updateEvent = await Event.findByIdAndUpdate(id, { reasonOfRejection: reason, eventStatus: 'REJECTED' }, { new: true });
          if (!updateEvent) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update Event');
          }
          return updateEvent;
     }
     const updateEvent = await Event.findByIdAndUpdate(id, { eventStatus: 'APPROVED' }, { new: true });
     if (!updateEvent) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update Event');
     }
     return updateEvent;
};

export const AdminService = {
     createAdminToDB,
     deleteAdminFromDB,
     getAdminFromDB,
     eventsActionFromDB,
};
