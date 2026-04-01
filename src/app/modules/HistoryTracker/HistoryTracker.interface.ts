import { Types } from 'mongoose';

export enum ERecordType {
     BLOCK_USER = 'BLOCK_USER',
     MATCH_USER = 'MATCH_USER',
     REPORT_USER = 'REPORT_USER',
     REPORT_EVENT = 'REPORT_EVENT',
     EVENT_GUEST = 'EVENT_GUEST',
}

export enum EReferenceModule {
     USER = 'User',
     EVENT = 'Event',
}

export interface IHistoryTracker {
     approachedBy: Types.ObjectId;
     recordType: ERecordType;
     referenceModule: EReferenceModule;
     referenceId: Types.ObjectId;
     description?: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IHistoryTrackerFilters = {
     searchTerm?: string;
};
