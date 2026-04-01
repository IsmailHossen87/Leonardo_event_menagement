import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IHistoryTracker } from './HistoryTracker.interface';
import { HistoryTracker } from './HistoryTracker.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createHistoryTracker = async (payload: IHistoryTracker): Promise<IHistoryTracker> => {
     const result = await HistoryTracker.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'HistoryTracker not found.');
     }
     return result;
};

const getAllHistoryTrackers = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IHistoryTracker[] }> => {
     const queryBuilder = new QueryBuilder(HistoryTracker.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedHistoryTrackers = async (): Promise<IHistoryTracker[]> => {
     const result = await HistoryTracker.find();
     return result;
};

const updateHistoryTracker = async (id: string, payload: Partial<IHistoryTracker>): Promise<IHistoryTracker | null> => {
     const isExist = await HistoryTracker.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'HistoryTracker not found.');
     }

     return await HistoryTracker.findByIdAndUpdate(id, payload, { new: true });
};

const deleteHistoryTracker = async (id: string): Promise<IHistoryTracker | null> => {
     const result = await HistoryTracker.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'HistoryTracker not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteHistoryTracker = async (id: string): Promise<IHistoryTracker | null> => {
     const result = await HistoryTracker.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'HistoryTracker not found.');
     }
     return result;
};

const getHistoryTrackerById = async (id: string): Promise<IHistoryTracker | null> => {
     const result = await HistoryTracker.findById(id);
     return result;
};

export const HistoryTrackerService = {
     createHistoryTracker,
     getAllHistoryTrackers,
     getAllUnpaginatedHistoryTrackers,
     updateHistoryTracker,
     deleteHistoryTracker,
     hardDeleteHistoryTracker,
     getHistoryTrackerById,
};
