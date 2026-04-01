import { Request, Response } from "express";
import { StoryService } from "./feed.service";
import { JwtPayload } from "jsonwebtoken";

const createStory = async (req: Request, res: Response) => {
    const user = req.user;
    const { eventId } = req.params;
    const story = await StoryService.createStory(req.body, user as JwtPayload, eventId);

    res.status(201).json({
        success: true,
        data: story,
    });
};



const getStories = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const user = req.user;
    const stories = await StoryService.getEventStories(eventId, user as JwtPayload);

    res.json({
        success: true,
        data: stories,
    });
};

const likeStory = async (req: Request, res: Response) => {

    const { storyId } = req.params;
    const user = req.user;
    console.log("user", user);

    const story = await StoryService.likeStory(storyId, user as JwtPayload);

    res.json({
        success: true,
        data: story,
    });
};

const addComment = async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const user = req.user;
    const { message } = req.body;

    const story = await StoryService.addComment(
        storyId,
        user as JwtPayload,
        message
    );

    res.json({
        success: true,
        data: story,
    });
};


const replyComment = async (req: Request, res: Response) => {

    const { storyId, commentId } = req.params;
    const { message } = req.body;
    const user = req.user;

    const result = await StoryService.replyComment(
        storyId,
        commentId,
        user as JwtPayload,
        message
    );

    res.status(200).json({
        success: true,
        data: result
    });
};
export const StoryController = {
    createStory,
    getStories,
    likeStory,
    addComment,
    replyComment
};