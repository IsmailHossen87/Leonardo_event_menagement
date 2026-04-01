import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HistoryTrackerService } from './HistoryTracker.service';

const createHistoryTracker = catchAsync(async (req: Request, res: Response) => {
     const result = await HistoryTrackerService.createHistoryTracker(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTracker created successfully',
          data: result,
     });
});

const getAllHistoryTrackers = catchAsync(async (req: Request, res: Response) => {
     const result = await HistoryTrackerService.getAllHistoryTrackers(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTrackers retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedHistoryTrackers = catchAsync(async (req: Request, res: Response) => {
     const result = await HistoryTrackerService.getAllUnpaginatedHistoryTrackers();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTrackers retrieved successfully',
          data: result,
     });
});

const updateHistoryTracker = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await HistoryTrackerService.updateHistoryTracker(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTracker updated successfully',
          data: result || undefined,
     });
});

const deleteHistoryTracker = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await HistoryTrackerService.deleteHistoryTracker(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTracker deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteHistoryTracker = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await HistoryTrackerService.hardDeleteHistoryTracker(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTracker deleted successfully',
          data: result || undefined,
     });
});

const getHistoryTrackerById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await HistoryTrackerService.getHistoryTrackerById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'HistoryTracker retrieved successfully',
          data: result || undefined,
     });
});  

export const HistoryTrackerController = {
     createHistoryTracker,
     getAllHistoryTrackers,
     getAllUnpaginatedHistoryTrackers,
     updateHistoryTracker,
     deleteHistoryTracker,
     hardDeleteHistoryTracker,
     getHistoryTrackerById
};
