import { JwtPayload } from "jsonwebtoken"
import { Chat } from "../chat/chat.model";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import AppError from "../../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { Status } from "./status.model";
import QueryBuilder from "../../builder/QueryBuilder";

const getChatPartners = async (user: JwtPayload) => {
    const userId = user.id;
    const chats = await Chat.find({
        participants: { $in: [new mongoose.Types.ObjectId(userId)] },
        status: 'active',
        isDeleted: false
    });
    const participantIds = new Set<string>();
    chats.forEach(chat => {
        chat.participants.forEach((p: mongoose.Types.ObjectId) => {
            if (p.toString() !== userId) {
                participantIds.add(p.toString());
            }
        });
    });

    // 3️⃣ Ei participant IDs-er user info fetch koro
    const users = await User.find({
        _id: { $in: Array.from(participantIds) },
        status: 'active',
        verified: true
    }).select('_id name email image role');

    return users;
};

const createStatus = async (user: JwtPayload, payload: any) => {
    const userId = user.id;
    const { color, text } = payload;

    // 1️⃣ User er status_expiry_time check koro
    const userDoc = await User.findById(userId);
    if (!userDoc) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const checkUserChat = await Chat.findOne({
        participants: { $in: [new mongoose.Types.ObjectId(userId)] },
        status: 'active',
    });
    if (!checkUserChat) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User chat not found');
    }

    // 3️⃣ Create status
    const status = await Status.create({
        userId,
        color,
        text,
    });

    // 4️⃣ Socket emit koro
    // const io = global.io ;
    // io.emit(`newStatus::${userId}`, status);

    return status;
};


const getAllStatus = async (user: JwtPayload, query: any) => {
    const userId = user.id;
    const chats = await Chat.find({
        participants: { $in: [new mongoose.Types.ObjectId(userId)] },
        status: 'active',
        isDeleted: false
    });
    const participantIds = new Set<string>();
    chats.forEach(chat => {
        chat.participants.forEach((p: mongoose.Types.ObjectId) => {
            if (p.toString() !== userId) {
                participantIds.add(p.toString());
            }
        });
    });

    // Include the current user's ID
    const userIdsForStatus = [
        ...Array.from(participantIds),
        userId
    ];

    const userQuery: any = {
        _id: { $in: userIdsForStatus },
        status: 'active',
        verified: true
    };

    // Apply search filter if searchTerm is provided
    if (query?.searchTerm) {
        userQuery.name = { $regex: query.searchTerm, $options: 'i' };
    }

    // Fetch the matched users based on the query
    const matchedUsers = await User.find(userQuery).select('_id');

    const status = new QueryBuilder(Status.find({
        userId: { $in: matchedUsers.map(user => user._id) }
    }).populate('userId', '_id name email image role')
        .sort({ createdAt: -1 }), query)


    const result = await status.filter().search(["name"]).sort().paginate().fields().modelQuery;
    const meta = await status.countTotal();

    return {
        result,
        meta
    }
};

const getStatusById = async (id: string) => {
    const status = await Status.findById(id)
    if (!status) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Status not found');
    }
    return status;
}
export const StatusService = { getChatPartners, createStatus, getAllStatus, getStatusById }