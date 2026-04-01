import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { IUser, UserModel } from './user.interface';

const userSchema = new Schema<IUser, UserModel>(
     {
          name: {
               type: String,
               required: true,
          },
          role: {
               type: String,
               enum: Object.values(USER_ROLES),
               default: USER_ROLES.USER,
          },
          email: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
          },
          password: {
               type: String,
               required: function () {
                    // Password is only required for non-OAuth users
                    return !this.oauthProvider;
               },
               select: false,
               minlength: 8,
          },
          image: {
               type: String,
               default: '',
          },
          gallary: {
               type: [String],
               default: [],
          },
          status: {
               type: String,
               enum: ['active', 'blocked'],
               default: 'active',
          },
          verified: {
               type: Boolean,
               default: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          stripeCustomerId: {
               type: String,
               default: '',
          },
          // OAuth fields
          googleId: {
               type: String,
               sparse: true,
          },
          facebookId: {
               type: String,
               sparse: true,
          },
          oauthProvider: {
               type: String,
               enum: ['google', 'facebook'],
          },
          gender: {
               type: String,
               enum: ['male', 'female', 'other'],
               default: 'male',
          },
          meetPerson: {
               type: String,
               enum: ['male', 'female', 'both'],
               default: 'both',
          },
          bio: {
               type: String,
               default: '',
          },
          interests: {
               type: [String],
               default: ["INTERSTScHECK"],
          },
          links: {
               type: [String],
               default: [],
          },
          hobbies: {
               type: [String],
               default: [],
          },
          authentication: {
               type: {
                    isResetPassword: {
                         type: Boolean,
                         default: false,
                    },
                    oneTimeCode: {
                         type: Number,
                         default: null,
                    },
                    expireAt: {
                         type: Date,
                         default: null,
                    },
               },
               select: false,
          },
          isNewMatchNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          isMatchOtherUser: {
               type: {
                    isMatchOtherUser: { type: Boolean, default: false },
                    approveRequest: { type: Boolean, default: false },
                    userId: { type: Schema.Types.ObjectId, ref: 'User' },
               },
               default: {}, select: false
          },

          isNewStatusUploadNotificaitonEnabled: {
               type: Boolean,
               default: false,
          },
          isNewMessageRecievedNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          isEventUpdateNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          isUpcomingEventReminderNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          isProfileViewNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          isNewAppUpdateNotificationEnabled: {
               type: Boolean,
               default: false,
          },
          saveDraft: {
               type: String,
               enum: ['isSaved', 'isNotSaving'],
               default: 'isNotSaving',
          },
          message: {
               type: String,
               default: '',
          },
          subscription: {
               type: Schema.Types.ObjectId,
               ref: 'Subscription',
          },
     },
     { timestamps: true },
);

// Exist User Check
userSchema.statics.isExistUserById = async (id: string) => {
     return await User.findById(id);
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
     return await User.findOne({ email });
};
userSchema.statics.isExistUserByPhone = async (contact: string) => {
     return await User.findOne({ contact });
};
// Password Matching
userSchema.statics.isMatchPassword = async (password: string, hashPassword: string): Promise<boolean> => {
     return await bcrypt.compare(password, hashPassword);
};

// Pre-Save Hook for Hashing Password & Checking Email Uniqueness
userSchema.pre('save', async function (next) {
     // Only check email uniqueness if this is a new user or email is being changed
     if (this.isNew || this.isModified('email')) {
          const existingUser = await User.findOne({ email: this.get('email') });
          if (existingUser && existingUser._id.toString() !== this._id.toString()) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Email already exists!');
          }
     }

     // Only hash password if it's provided and modified
     if (this.password && this.isModified('password')) {
          this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
     }

     // Auto-verify OAuth users
     if (this.oauthProvider && !this.verified) {
          this.verified = true;
     }

     next();
});

// // Query Middleware
// userSchema.pre('find', function (next) {
//      this.find({ isDeleted: { $ne: true } });
//      next();
// });

// userSchema.pre('findOne', function (next) {
//      this.find({ isDeleted: { $ne: true } });
//      next();
// });

// userSchema.pre('aggregate', function (next) {
//      this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
//      next();
// });
export const User = model<IUser, UserModel>('User', userSchema);
