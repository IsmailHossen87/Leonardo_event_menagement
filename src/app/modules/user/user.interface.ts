import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
export type IisMatchOtherUser = {
     isMatchOtherUser: boolean;
     approveRequest: boolean;
     userId: Types.ObjectId;
}
export type IUser = {
     name: string;
     role: USER_ROLES;
     email: string;
     password?: string;
     image?: string;
     birthDate?: Date;
     birthLocation?: string;

     gallary?: string[];
     isDeleted: boolean;
     gender: 'male' | 'female' | 'other';
     meetPerson: 'male' | 'female' | 'both';
     bio: string;
     interests: string[];
     links: string[];
     hobbies: string[]
     stripeCustomerId: string;
     status: 'active' | 'blocked';
     verified: boolean;
     googleId?: string;
     facebookId?: string;
     oauthProvider?: 'google' | 'facebook';
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode: number;
          expireAt: Date;
     };
     // for notifications
     isNewMatchNotificationEnabled: boolean;
     isNewStatusUploadNotificaitonEnabled: boolean;
     isNewMessageRecievedNotificationEnabled: boolean;
     isEventUpdateNotificationEnabled: boolean;
     isUpcomingEventReminderNotificationEnabled: boolean;
     isProfileViewNotificationEnabled: boolean;
     isNewAppUpdateNotificationEnabled: boolean;
     saveDraft: 'isSaved' | 'isNotSaving';
     subscription: Types.ObjectId;
     message: string;
     isMatchOtherUser: IisMatchOtherUser;
};


export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isExistUserByPhone(contact: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
