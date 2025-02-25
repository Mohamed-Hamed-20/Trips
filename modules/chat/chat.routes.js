import express from "express";
import { createChat, getChatById } from "./controller/chat.controller.js";
import { auth, roles } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", auth(), createChat);

router.get("/:chatId", auth(), getChatById);

export default router;
