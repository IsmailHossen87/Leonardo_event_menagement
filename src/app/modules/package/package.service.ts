import AppError from '../../../errors/AppError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { StatusCodes } from 'http-status-codes';

// -- -------------- create package --------------
export const createPackageIntoDB = async (payload: IPackage) => {
     // check if package already exist
     const existingPackage = await Package.exists({
          name: payload.name,
          isDeleted: false,
     });
     if (existingPackage) {
          throw new AppError(StatusCodes.CONFLICT, 'Package already exists');
     }

     const result = await Package.create(payload);
     return result;
};

// -------------- update package --------------
const updatePackageIntoDB = async (id: string, payload: Partial<IPackage>) => {
     // check if package exists
     const existingPackage = await Package.findById(id);
     if (!existingPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }
     // check if the name already taken
     if (payload.name && payload.name !== existingPackage.name) {
          const nameTaken = await Package.exists({
               name: payload.name,
               isDeleted: false,
               _id: { $ne: id },
          });
          if (nameTaken) {
               throw new AppError(StatusCodes.CONFLICT, 'Package name already in use');
          }
     }

     const result = await Package.findByIdAndUpdate(id, payload, { new: true });
     return result;
};

// -------------- delete package --------------
const deletePackageFromDB = async (id: string) => {
     // check if package exists
     const existingPackage = await Package.exists({ _id: id });
     if (!existingPackage) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
     }

     const result = await Package.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
     return result;
};

// ------------ get all packages --------------
const getAllPackagesFromDB = async () => {
     const result = await Package.find({ isDeleted: false });
     return result;
};

export const PackageService = {
     createPackageIntoDB,
     getAllPackagesFromDB,
     updatePackageIntoDB,
     deletePackageFromDB,
};
