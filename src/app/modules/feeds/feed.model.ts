import mongoose, { Schema, Document } from "mongoose";

export interface IEventStory extends Document {
    eventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    video: string;
    caption?: string;

    likes: mongoose.Types.ObjectId[];

    comments: {
        userId: mongoose.Types.ObjectId;
        message: string;
        replies: {
            userId: mongoose.Types.ObjectId;
            message: string;
            createdAt: Date;
        }[];
        createdAt: Date;
    }[];
    createdAt: Date;
}

const eventStorySchema = new Schema<IEventStory>(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, },
        video: { type: String, required: true, },
        caption: { type: String },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        comments: [
            {
                userId: { type: Schema.Types.ObjectId, ref: "User", },
                message: String,
                replies: [
                    {
                        userId: { type: Schema.Types.ObjectId, ref: "User", },
                        message: String,
                        createdAt: { type: Date, default: Date.now, },
                    },
                ],
                createdAt: { type: Date, default: Date.now, },
            },
        ],
    },

    { timestamps: true }
);

export const EventStory = mongoose.model<IEventStory>(
    "EventStory",
    eventStorySchema
);