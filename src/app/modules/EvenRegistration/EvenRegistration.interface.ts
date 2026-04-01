import { Types } from 'mongoose';
export enum EAttendingAs {
     VOLUNTEER = 'VOLUNTEER',
     GUEST = 'GUEST',
}
export interface IEvenRegistration {
     event: Types.ObjectId;
     user: Types.ObjectId;
     attendingAs: EAttendingAs;
     noOfAttendees: number;
     specialRequest: string;
     userReportAgainstEventRegistration?: string;
     isProfileVisibleToAttendees: boolean;
     isAllowedChatAndMatchWithAttendees: boolean;
     status: 'PENDING' | 'APPROVED' | 'REJECTED';
     createdAt: Date;
     relationShipStatus: 'SINGLE' | 'MINGLE';
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
     verified: boolean;
     otp: {
          code: number | null;
          expireAt: Date | null;
     }
     isHostRequest: boolean;
     hostRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type IEvenRegistrationFilters = {
     searchTerm?: string;
};
