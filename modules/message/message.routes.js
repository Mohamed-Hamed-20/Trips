import { Router } from "express";
import * as MC from "./controller/message.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/asyncHandler.js";

const router = Router();

router.get(
  "/conversation/history",
  auth([roles.Admin, roles.User, roles.Traveler]),
  asyncHandler(MC.getHistory)
);

router.get(
  "/recent-conversations",
  auth([roles.User, roles.Traveler, roles.Admin]),
  asyncHandler(MC.lastconversations)
);

router.get(
  "/",
  auth([roles.User, roles.Admin, roles.Traveler]),
  asyncHandler(MC.getMessages)
);

export default router;
