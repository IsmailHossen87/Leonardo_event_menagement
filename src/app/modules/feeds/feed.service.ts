import mongoose from "mongoose";
import { EventStory } from "./feed.model";
import { JwtPayload } from "jsonwebtoken";
import { Event } from "../Event/Event.model";
import { EvenRegistration } from "../EvenRegistration/EvenRegistration.model";

const createStory = async (payload: any, user: JwtPayload, eventId: string) => {
    const data = {
        ...payload,
        userId: user?.id,
        eventId,
    }
    const story = await EventStory.create(data);
    const populatedStory = await EventStory.findById(story._id).populate("userId", "name video");
    return populatedStory;
};


const getEventStories = async (eventId: string, user: JwtPayload) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error("Event not found");
    }
    const checkUser = await EvenRegistration.findOne({ user: user.id });
    if (!checkUser) {
        throw new Error("You are not registered for this event");
    }
    const revealTime = new Date(event.revealTime);

    // const oneHourBeforeReveal = new Date(
    //     revealTime.getTime() - 60 * 60 * 1000
    // );

    // const now = new Date();

    // if (now > oneHourBeforeReveal) {
    //     return [];
    // }

    const stories = await EventStory.find({ eventId })
        .populate("userId", "name image")
        .sort({ createdAt: -1 })
        .lean();

    const storiesWithCounts = stories.map((story) => ({
        ...story,
        likeCount: story.likes ? story.likes.length : 0,
        commentCount: story.comments ? story.comments.length : 0,
    }));


    return { stories: storiesWithCounts };
};


const likeStory = async (storyId: string, user: JwtPayload) => {
    const story = await EventStory.findById(storyId);

    if (!story) {
        throw new Error("Story not found");
    }
    console.log("user.id", user);
    const isLiked = story.likes.includes(new mongoose.Types.ObjectId(user.id));
    console.log("isLiked", isLiked);

    if (isLiked) {
        story.likes = story.likes.filter(
            (id) => id.toString() !== user.id
        );
    } else {
        story.likes.push(new mongoose.Types.ObjectId(user.id));
    }

    await story.save();

    return story;
};

const addComment = async (storyId: string, user: JwtPayload, message: string) => {
    const story = await EventStory.findById(storyId);
    if (!story) {
        throw new Error("Story not found");
    }

    story.comments.push({
        userId: user.id,
        message,
        replies: [],
        createdAt: new Date(),
    });

    await story.save();
    return story;
};

const replyComment = async (
    storyId: string,
    commentId: string,
    user: JwtPayload,
    message: string
) => {

    const story: any = await EventStory.findById(storyId);

    if (!story) {
        throw new Error("Story not found");
    }

    const comment = story.comments.id(commentId);

    if (!comment) {
        throw new Error("Comment not found");
    }

    comment.replies.push({
        userId: user.id,
        message,
        createdAt: new Date()
    });

    await story.save();

    return story;
};

export const StoryService = {
    createStory,
    getEventStories,
    likeStory,
    addComment,
    replyComment
};