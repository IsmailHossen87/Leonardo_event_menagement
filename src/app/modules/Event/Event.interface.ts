import { Types } from 'mongoose';

export interface IEvent {
     eventName: string;
     eventType: string; // conference, wedding
     image: string;
     images: string[];
     eventQRImage: string;
     eventDate: string;
     // eventTime: string;
     // eventDateTime: Date;
     // newAdd Value
     eventEndDate: string;
     eventStartTime: string;
     eventEndTime: string;
     eventLocation: string;
     latitude: string;
     longitude: string;
     eventDescription: string;
     ageLimitMax: number;
     ageLimitMin: number;
     eventBrandColor: string; // hex color set by admin
     eventThemeColor: string; // hex color
     eventFontColor: string; // hex color
     isVisibilityPublic: boolean; // default true
     isLockedAfterExpiration: boolean; // set by admin
     eventAttendeeLimit: number;
     registrationCount: number;
     eventCode: number;
     createdBy: Types.ObjectId;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     host: Types.ObjectId[];
     messageFreezePermission: boolean;
     sendGroupChatPermission: boolean;
     deletedAt?: Date;
     eventStatus: string;
     eventPosition: string;
     reasonOfRejection?: string;
     totalReport: number;
     revealTime: Date;
}

export type IEventFilters = {
     searchTerm?: string;
};
