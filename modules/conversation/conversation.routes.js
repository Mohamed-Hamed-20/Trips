import express from "express";
import * as CC from "./controller/conversation.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/asyncHandler.js";
import { validation } from "../../middleware/validation.js";
import {
  queryValidationSchema,
  tokenValidation,
} from "./conversation.validation.js";

const router = express.Router();

router.post(
  "/",
  validation(tokenValidation),
  auth([roles.Admin, roles.User, roles.Traveler]),
  asyncHandler(CC.createconversation)
);

router.get(
  "/",
  validation(tokenValidation),
  validation(queryValidationSchema(CC.allowConversationSortFields)),
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(CC.searchConversations)
);

router.get(
  "/:conversationId",
  validation(tokenValidation),
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(CC.getconversationById)
);

export default router;
