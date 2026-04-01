import { Request, Response, NextFunction } from 'express';
import { SubscriptionServices } from './subscription.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IJwtData } from '../../../types/auth';

// create subscription
const createSubscription = catchAsync(async (req: Request, res: Response) => {
     const result = await SubscriptionServices.createSubscriptionIntoDB({
          ...req.body,
          user: (req.user as IJwtData)?.id,
     });

     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Subscription created successfully',
          data: result,
     });
});

// get my subscription
const getMySubscription = catchAsync(async (req: Request, res: Response) => {
     const result = await SubscriptionServices.getMySubscriptionIntoDB((req.user as IJwtData)?.id, req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'My subscription retrieved successfully',
          data: result,
     });
});

export const SubscriptionController = {
     createSubscription,
     getMySubscription,
};
