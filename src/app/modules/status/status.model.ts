import { model, Schema, Types } from "mongoose"

export interface IStatus {
    userId: Types.ObjectId
    color: string,
    text: string,
    createdAt?: Date,
}


const statusSchema = new Schema({
    userId: { type: Types.ObjectId, required: true, ref: 'User' },
    color: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Documents will be automatically deleted after 3600 seconds (1 hour)
})

export const Status = model<IStatus>('Status', statusSchema)