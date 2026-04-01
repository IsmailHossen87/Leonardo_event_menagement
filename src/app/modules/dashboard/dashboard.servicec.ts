import mongoose from "mongoose"
import { USER_ROLES } from "../../../enums/user"
import AppError from "../../../errors/AppError"
import { EvenRegistration } from "../EvenRegistration/EvenRegistration.model"
import { Event, Report } from "../Event/Event.model"
import { Subscription } from "../subscription/subscription.model"
import { User } from "../user/user.model"
import httpStatus from "http-status-codes"
import { Chat } from "../chat/chat.model"
import { Message, ViolateMessage } from "../message/message.model"

const showAllData = async (user: any) => {
    const userInfo = await User.findById(user.id)
    if (!userInfo) throw new AppError(httpStatus.NOT_FOUND, "User not found")
    if (userInfo.role !== USER_ROLES.SUPER_ADMIN && USER_ROLES.ADMIN !== userInfo.role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this data")
    }

    const totalUsers = await User.countDocuments()
    const totalActiveEvent = await Event.countDocuments()
    const totalSubscription = await Subscription.countDocuments()
    // const totalRevenue = ()

    //  Top performing event 
    const topPerformingEvent = await Event.find().sort({ registrationCount: -1 }).limit(5).select("eventName registrationCount")

    return { totalUsers, totalActiveEvent, totalSubscription, topPerformingEvent }

}

// USER MANAGEMENT
const showUserDashboardData = async (user: any) => {
    const userInfo = await User.findById(user.id)
    if (!userInfo) throw new AppError(httpStatus.NOT_FOUND, "User not found")
    if (userInfo.role !== USER_ROLES.SUPER_ADMIN && USER_ROLES.ADMIN !== userInfo.role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this data")
    }

    const allUser = await User.find({
        role: "USER"
    }).select("name email role createdAt status")
    if (!allUser) throw new AppError(httpStatus.NOT_FOUND, "User not found")

    return allUser

}


// UPDATE USER STATUS
const updateUserStatus = async (user: any, id: string) => {
    const userInfo = await User.findById(user.id)
    if (!userInfo) throw new AppError(httpStatus.NOT_FOUND, "User not found")
    if (userInfo.role !== USER_ROLES.SUPER_ADMIN && USER_ROLES.ADMIN !== userInfo.role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this data")
    }

    const userStatus = await User.findById(id)
    if (!userStatus) throw new AppError(httpStatus.NOT_FOUND, "User not found")
    if (userStatus.role !== USER_ROLES.USER) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this data")
    }

    if (userStatus) {
        userStatus.status = userStatus.status === "active" ? "blocked" : "active"
    }
    await userStatus.save()

    return `${userStatus.name} status ${userStatus.status} successfully`

}

const userDetails = async (userId: any, user: any) => {
    const userInfo = await User.findById(user.id)
    if (!userInfo) throw new AppError(httpStatus.NOT_FOUND, "User not found")

    if (userInfo.role !== USER_ROLES.SUPER_ADMIN && USER_ROLES.ADMIN !== userInfo.role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to access this data")
    }

    const userIdConvert = new mongoose.Types.ObjectId(userId)

    const totalventAttende = await EvenRegistration.countDocuments({ user: userIdConvert })
    const totalMessageSent = await Message.countDocuments({ sender: userIdConvert })
    const totalReport = await Report.countDocuments({ userId: userIdConvert })


    const userDetails = await User.findById(userId).lean();
    if (!userDetails) throw new AppError(httpStatus.NOT_FOUND, "user not found")

    let totalEvent;
    let activeEvent;
    let trastSignal;
    let reportMessage;
    let chatViolate;

    if (userDetails.role === USER_ROLES.ORGANIZER) {
        totalEvent = await Event.countDocuments({ createdBy: userIdConvert })

        activeEvent = await Event.countDocuments({
            createdBy: userIdConvert,
            eventStatus: 'APPROVED'
        })

        const event = await Event.findOne({ createdBy: userIdConvert }).lean()
        if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found")
        trastSignal = await Report.countDocuments({ eventId: event._id })
        reportMessage = await Report.find({ eventId: event._id }).sort({ createdAt: -1 }).limit(3).select("reason createdAt ").populate({ path: "reporter", select: "name" })

    } else {
        reportMessage = await Report.find({ reporter: userIdConvert }).sort({ createdAt: -1 }).limit(3).select("reason createdAt ").populate({ path: "reporter", select: "name" })

        chatViolate = await ViolateMessage.countDocuments({ reportedUserId: userIdConvert })

    }

    return {
        data: userDetails,
        totalventAttende,
        totalMessageSent,
        totalReport,
        reportMessage,
        OrganizerHistory: {
            totalEvent,
            activeEvent,
            trastSignal
        },
        chatViolate
    }

}

export const dashboardService = {
    showAllData,
    showUserDashboardData,
    updateUserStatus,
    userDetails
}