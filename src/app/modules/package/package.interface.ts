import { Model } from 'mongoose';
import { PackageInterval } from './package.constant';

export interface IPackage {
     _id: string;
     name: string;
     price: number;
     description: string;
     features?: string[];
     interval: PackageInterval;
     intervalCount: number;
     eventCountLimit: number;
     googleProductId?: string; // Google Play SKU
     appleProductId?: string; // App Store Product ID
     isDeleted: boolean;
}

export type PackageModel = Model<IPackage>;
