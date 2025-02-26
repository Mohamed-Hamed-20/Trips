import express from "express";
import * as uc from "./controller/user.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(uc.searchUsers)
);
export default router;
