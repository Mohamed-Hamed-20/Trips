import { Router } from "express";
import { getHistory, lastchats } from "./controller/message.controller.js";
import { auth, roles } from "../../middleware/auth.js";

const router = Router();
router.get("/chat/history", auth(), getHistory);

router.get("/recent-chats", auth(), lastchats);
export default router;
