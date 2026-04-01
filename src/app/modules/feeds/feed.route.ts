import express from "express";
import { StoryController } from "./feed.controller";
import fileUploadHandler from "../../middleware/fileUploadHandler";
import parseFileData from "../../middleware/parseFileData";
import { IFOLDER_NAMES } from "../../../enums/files";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();

router.post(
    "/:eventId",
    fileUploadHandler(),
    parseFileData(IFOLDER_NAMES.VIDEO),
    auth(USER_ROLES.USER),
    StoryController.createStory
);

router.get(
    "/:eventId",
    auth(USER_ROLES.USER),
    StoryController.getStories
);

router.patch(
    "/like/:storyId",
    auth(USER_ROLES.USER),
    StoryController.likeStory
);

router.post(
    "/comment/:storyId",
    auth(USER_ROLES.USER),
    StoryController.addComment
);
router.post(
    "/reply/:storyId/:commentId",
    auth(USER_ROLES.USER),
    StoryController.replyComment
);

export const NewsFeedRoutes = router;