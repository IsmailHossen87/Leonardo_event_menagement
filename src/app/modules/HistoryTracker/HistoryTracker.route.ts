import express from 'express';
import { HistoryTrackerController } from './HistoryTracker.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { HistoryTrackerValidation } from './HistoryTracker.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/', auth(...Object.values(USER_ROLES)), validateRequest(HistoryTrackerValidation.createHistoryTrackerZodSchema), HistoryTrackerController.createHistoryTracker);

router.get('/', HistoryTrackerController.getAllHistoryTrackers);

router.get('/unpaginated', HistoryTrackerController.getAllUnpaginatedHistoryTrackers);

router.delete('/hard-delete/:id', auth(...Object.values(USER_ROLES)), HistoryTrackerController.hardDeleteHistoryTracker);

// router.delete('/:id', auth(...Object.values(USER_ROLES)), HistoryTrackerController.deleteHistoryTracker);

router.get('/:id', HistoryTrackerController.getHistoryTrackerById);

export const HistoryTrackerRoutes = router;
