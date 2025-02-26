import express from "express";
import {
  createconversation,
  getconversationById,
} from "./controller/conversation.controller.js";
import { auth, roles } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", auth(), createconversation);

router.get("/:conversationId", auth(), getconversationById);

export default router;
