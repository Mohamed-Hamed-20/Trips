import express from "express";
import { searchUsers } from "./controller/user.controller.js";


const router = express.Router();

router.get(
  "/search",
  searchUsers
);

export default router;
