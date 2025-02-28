import jwt from "jsonwebtoken";
import userModel from "../DB/model/user.model.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import redis from "../DB/redis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../config/.env") });

export const handleToken = async (token, socketId) => {
  try {
    const decoded = jwt.verify(token, process.env.tokenSignature);

    if (!decoded?.id || !decoded?.isLoggedIn) {
      throw new Error("Invalid token payload");
    }

    let user = await redis.get(`user-${decoded.id}`);

    if (user) {
      user = JSON.parse(user);
    }

    if (!user || Object.keys(user).length === 0) {
      user = await userModel
        .findById(decoded.id)
        .select("-password -confirmEmail -wishlist")
        .lean();

      if (!user) {
        throw new Error("User not found");
      }
    }

    user.socketId = socketId;

    await redis.set(`user-${user._id}`, JSON.stringify(user));
    await redis.expire(`user-${user._id}`, 900);

    return user;
  } catch (error) {
    console.error("Auth error:", error.message);
    throw new Error("Authentication failed");
  }
};
