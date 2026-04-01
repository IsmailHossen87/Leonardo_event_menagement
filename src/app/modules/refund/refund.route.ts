import express from 'express';
import { RefundController } from './refund.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// Organizer applies for refund
router.post(
    '/',
    auth(USER_ROLES.ORGANIZER),
    RefundController.applyForRefund,
);

// Admin gets all refund requests
router.get(
    '/',
    auth(USER_ROLES.SUPER_ADMIN),
    RefundController.getAllRefundRequests,
);

// Admin approves or rejects refund
router.patch(
    '/:id',
    auth(USER_ROLES.SUPER_ADMIN),
    RefundController.updateRefundStatus,
);

export const RefundRoutes = router;
