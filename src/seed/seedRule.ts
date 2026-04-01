import { Rule } from '../app/modules/rule/rule.model';
import { EContentType, EPermissionType, EValuesTypes } from '../app/modules/rule/rule.interface';
import { logger } from '../shared/logger';
import colors from 'colors';
import mongoose from 'mongoose';
import config from '../config';

// Sample rules data that matches the IRule interface
const rulesData = [
     // Content Types
     {
          content: 'Privacy policy content goes here...',
          type: EContentType.privacy,
     },
     {
          content: 'Terms and conditions content goes here...',
          type: EContentType.terms,
     },
     {
          content: 'About us content goes here...',
          type: EContentType.about,
     },
     {
          content: 'App explanation content goes here...',
          type: EContentType.appExplain,
     },
     {
          content: 'Support information goes here...',
          type: EContentType.support,
     },
     // Social Media
     {
          type: EContentType.socialMedia,
          content: {
               facebook: 'https://facebook.com/yourpage',
               twitter: 'https://twitter.com/yourhandle',
               instagram: 'https://instagram.com/yourprofile',
               linkedin: 'https://linkedin.com/company/yourcompany',
               whatsapp: 'https://wa.me/yournumber',
          },
     },
     // Permission Settings
     {
          permission: true,
          permissionType: EPermissionType.IS_EMAIL_NOTIFICATIONS,
     },
     {
          permission: true,
          permissionType: EPermissionType.IS_APP_NOTIFICATIONS,
     },
     {
          permission: true,
          permissionType: EPermissionType.IS_AUTO_APPROVE_EVENTS,
     },
     // System Values
     {
          value: 15, // 15% VAT as an example
          valuesTypes: EValuesTypes.DEFAULT_VAT,
     },
];

// Function to seed rules
const seedRules = async () => {
     try {
          // Connect to MongoDB
          await mongoose.connect(config.database_url as string);
          logger.info(colors.blue('🔄 Connected to MongoDB'));

          // Delete all existing rules
          await Rule.deleteMany({});
          logger.info(colors.yellow('🧹 Cleared existing rules'));

          // Insert new rules
          await Rule.insertMany(rulesData);

          logger.info(colors.green('✨ --------------> Rules seeded successfully <-------------- ✨'));
          process.exit(0);
     } catch (error) {
          logger.error(colors.red('💥 Error seeding rules: 💥'), error);
          process.exit(1);
     } finally {
          // Close the connection
          await mongoose.connection.close();
     }
};

// Run the seed function
seedRules();
