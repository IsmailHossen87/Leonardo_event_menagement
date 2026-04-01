import express from 'express';
import { PackageController } from './package.controller';
import { PackageValidation } from './package.validation';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();

// create package
router.post('/create', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(PackageValidation.createPackageSchema), PackageController.createPackage);

// update package
router.patch('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(PackageValidation.updatePackageSchema), PackageController.updatePackage);

// delete package
router.delete('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PackageController.deletePackage);

// get all packages
router.get('/', auth(), PackageController.getAllPackages);

export const PackageRoutes = router;
