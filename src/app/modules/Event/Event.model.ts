import { Schema, model } from 'mongoose';
import { IEvent } from './Event.interface';

const EventSchema = new Schema<IEvent>(
     {
          eventName: { type: String, required: true },
          eventType: { type: String, required: true },
          image: { type: String, required: true },
          images: { type: [String], required: true, limit: 5 },
          eventQRImage: { type: String, required: false },
          eventDate: { type: String, required: true },
          // newAdd Value
          eventEndDate: { type: String, required: true },
          eventStartTime: { type: String, required: true },
          eventEndTime: { type: String, required: true },
          // eventTime: { type: String, required: true },
          // eventDateTime: { type: Date, required: true },
          eventLocation: { type: String, required: true },
          latitude: { type: String, required: true },
          longitude: { type: String, required: true },
          eventDescription: { type: String, required: true },
          ageLimitMax: { type: Number, required: true },
          ageLimitMin: { type: Number, required: true },
          eventBrandColor: { type: String, required: true },
          eventThemeColor: { type: String, required: true },
          eventFontColor: { type: String, required: true },
          isVisibilityPublic: { type: Boolean, required: true },
          isLockedAfterExpiration: { type: Boolean, required: true },
          eventAttendeeLimit: { type: Number, required: true },
          registrationCount: { type: Number, default: 0 },
          eventCode: { type: Number, required: true },
          createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
          eventStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED',], default: 'PENDING' },
          eventPosition: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], default: 'UPCOMING' },
          host: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
          sendGroupChatPermission: { type: Boolean, default: true },
          messageFreezePermission: { type: Boolean, default: false },
          reasonOfRejection: { type: String },
          totalReport: { type: Number, default: 0 },
          revealTime: { type: Date, default: new Date() },
     },
     { timestamps: true },
);

EventSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

EventSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

EventSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});


export const Event = model<IEvent>('Event', EventSchema);



const ReportSchema = new Schema(
     {
          // eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
          // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          // reportTyp
          // reason: { type: String, required: true },
          // isDeleted: { type: Boolean, default: false },
          reporter: { type: Schema.Types.ObjectId, ref: "User", required: true }, // যে report করছে
          eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null },
          reportedUser: { type: Schema.Types.ObjectId, ref: "User", default: null },

          reportType: {
               type: String,
               enum: ["EVENT", "USER"],
               required: true
          },
          reason: { type: String, required: true },
          isDeleted: { type: Boolean, default: false }
     },
     { timestamps: true },
);

export const Report = model('Report', ReportSchema);
