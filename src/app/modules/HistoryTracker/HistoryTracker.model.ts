import { Schema, model } from 'mongoose';
import { ERecordType, EReferenceModule, IHistoryTracker } from './HistoryTracker.interface';

const HistoryTrackerSchema = new Schema<IHistoryTracker>(
     {
          approachedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          recordType: { type: String, enum: Object.values(ERecordType), required: true },
          referenceModule: { type: String, enum: Object.values(EReferenceModule), required: true },
          referenceId: { type: Schema.Types.ObjectId, required: true, refPath: 'referenceModule' },
          description: { type: String },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

export const HistoryTracker = model<IHistoryTracker>('HistoryTracker', HistoryTrackerSchema);
