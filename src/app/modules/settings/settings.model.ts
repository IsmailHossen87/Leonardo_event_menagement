import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
     {
          primaryColor: { type: String },
          type: { type: String, enum: ['about_us', 'contact_us', 'privacy_policy', 'terms_and_conditions', 'faq'] },
          title: { type: String },
     },
     { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
