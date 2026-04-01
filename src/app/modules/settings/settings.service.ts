import path from 'path';
import { ISettings } from './settings.interface';
import Settings from './settings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

const upsertSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
     if (data.primaryColor) {
          const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
          if (!hexColorRegex.test(data.primaryColor)) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Primary color is not a valid hex color code');
          }
     }
     const existingSettings = await Settings.findOne({});
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({}, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          const newSettings = await Settings.create(data);
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};
const getSettings = async (type: string) => {

     console.log(type);
     const settings: any = await Settings.findOne({ type });
     if (type && settings[type]) {
          return settings[type];
     }
     return settings;
};

const getTermsOfService = async () => {
     const settings: any = await Settings.findOne();
     if (!settings) {
          return '';
     }
     return settings.termsOfService;
};
const getSupport = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          return '';
     }
     return settings.support;
};
const getprimaryColor = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          return '';
     }
     return { primaryColor: settings.primaryColor };
};
const getAboutUs = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          return '';
     }
     return settings.aboutUs;
};

// const getPrivacyPolicy = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'privacyPolicy.html');
// };

const getAccountDelete = async () => {
     return path.join(__dirname, '..', 'htmlResponse', 'accountDelete.html');
};

const addAnotherSetting = async (type: string, data: Partial<ISettings>): Promise<ISettings> => {
     const existingSettings = await Settings.findOne({ type });
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({ type }, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          const newSettings = await Settings.create({ ...data, type });
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};
export const settingsService = {
     upsertSettings,
     getSettings,
     getprimaryColor,
     getAccountDelete,
     getSupport,
     getTermsOfService,
     getAboutUs,
     addAnotherSetting
};
