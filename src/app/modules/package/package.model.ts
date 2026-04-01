import { model, Schema } from 'mongoose';
import { IPackage, PackageModel } from './package.interface';
import { PackageInterval } from './package.constant';

const packageSchema = new Schema<IPackage, PackageModel>(
     {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          description: { type: String, required: true },
          features: { type: [String] },
          interval: {
               type: String,
               enum: Object.values(PackageInterval),
               default: PackageInterval.MONTH,
          },
          intervalCount: { type: Number, default: 1 },
          eventCountLimit: { type: Number, default: 30 },
          googleProductId: { type: String, default: '' },
          appleProductId: { type: String, default: '' },
          isDeleted: { type: Boolean, default: false },
     },
     { timestamps: true },
);

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
