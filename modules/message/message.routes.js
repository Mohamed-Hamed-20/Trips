import { Router } from "express";
import {
  getHistory,
  lastconversations,
} from "./controller/message.controller.js";
import { auth, roles } from "../../middleware/auth.js";

const router = Router();
router.get("/conversation/history", auth(), getHistory);

router.get("/recent-conversations", auth(), lastconversations);
export default router;
