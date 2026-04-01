import express from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidations } from './subscription.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// create subscription

router.post('/create', auth(USER_ROLES.ORGANIZER), validateRequest(SubscriptionValidations.createSubscriptionSchema), SubscriptionController.createSubscription);
router.get('/', auth(USER_ROLES.ORGANIZER), SubscriptionController.getMySubscription);

export const subscriptionRoutes = router;
