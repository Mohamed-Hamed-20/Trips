import express from "express";
import * as uc from "./controller/user.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/asyncHandler.js";
import {
  queryValidationSchema,
  tokenValidation,
} from "../conversation/conversation.validation.js";
import { validation } from "../../middleware/validation.js";

const router = express.Router();

router.get(
  "/",
  validation(tokenValidation),
  validation(queryValidationSchema(uc.allowUserFields)),
  auth([roles.User, roles.Admin, roles.Organizer]),
  asyncHandler(uc.searchUsers)
);

export default router;
