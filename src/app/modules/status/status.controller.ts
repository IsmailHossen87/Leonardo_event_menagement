import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { StatusService } from './status.service';
import { JwtPayload } from 'jsonwebtoken';

const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await StatusService.getChatPartners(user as JwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Review Created Successfully',
        data: result,
    });
});

const createStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await StatusService.createStatus(user as JwtPayload, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Status Created Successfully',
        data: result,
    });
});


const getAllStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const query = req.query
    const result = await StatusService.getAllStatus(user as JwtPayload, query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Status Created Successfully',
        data: { ...result },
    });
});

const getStatusById = catchAsync(async (req: Request, res: Response) => {
    const result = await StatusService.getStatusById(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Status Created Successfully',
        data: result,
    });
});

export const StatusController = { getAllUser, createStatus, getAllStatus, getStatusById };
