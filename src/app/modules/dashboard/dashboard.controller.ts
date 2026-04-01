import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { dashboardService } from './dashboard.servicec';

const showAllData = catchAsync(async (req, res) => {
    const result = await dashboardService.showAllData(req.user)

    sendResponse(res,
        {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Dashboard data fetched successfully",
            data: result
        });
});

const showUserDashboardData = catchAsync(async (req, res) => {
    const result = await dashboardService.showUserDashboardData(req.user)

    sendResponse(res,
        {
            success: true,
            statusCode: StatusCodes.OK,
            message: "All userts fetched successfully",
            data: result
        });
});

const updateUserStatus = catchAsync(async (req, res) => {
    const result = await dashboardService.updateUserStatus(req.user, req.params.id)

    sendResponse(res,
        {
            success: true,
            statusCode: StatusCodes.OK,
            data: result
        });
});

// user details
const userDetials = catchAsync(async (req, res) => {
    const result = await dashboardService.userDetails(req.params.id, req.user)

    sendResponse(res,
        {
            success: true,
            statusCode: StatusCodes.OK,
            data: {
                user: result.data,
                reportMessage: result.reportMessage,
                totalventAttende: result.totalventAttende,
                totalMessage: result.totalMessageSent,
                totalReport: result.totalReport,
                totalChatViolate: result.chatViolate,
                organiderHistory: result.OrganizerHistory || {}
            }
        });
});


export const dashboardController = {
    showAllData,
    showUserDashboardData,
    updateUserStatus,
    userDetials
}