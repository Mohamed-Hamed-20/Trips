import express from "express";
import * as CC from "./controller/conversation.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/asyncHandler.js";

const router = express.Router();

router.post(
  "/",
  auth([roles.Admin, roles.User, roles.Traveler]),
  asyncHandler(CC.createconversation)
);
router.get(
  "/",
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(CC.searchConversations)
);
router.get(
  "/:conversationId",
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(CC.getconversationById)
);

export default router;
