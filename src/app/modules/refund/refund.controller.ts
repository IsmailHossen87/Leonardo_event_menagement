import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RefundService } from './refund.service';

// ✅ Organizer applies for refund
const applyForRefund = catchAsync(async (req: Request, res: Response) => {
     const result = await RefundService.applyForRefund(
          (req.user as any).id,
          req.body
     );

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Refund request submitted successfully',
          data: result,
     });
});

// ✅ Admin gets all refund requests
const getAllRefundRequests = catchAsync(async (req: Request, res: Response) => {
     const result = await RefundService.getAllRefundRequests(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Refund requests retrieved successfully',
          data: result,
     });
});

// ✅ Admin approves or rejects refund
const updateRefundStatus = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await RefundService.updateRefundStatus(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: `Refund request ${req.body.status.toLowerCase()} successfully`,
          data: result,
     });
});

export const RefundController = {
     applyForRefund,
     getAllRefundRequests,
     updateRefundStatus,
};
