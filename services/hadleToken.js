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

    let user = await redis.hgetall(`user-${decoded.id}`);

    if (Object.keys(user).length === 0) {
      user = await userModel
        .findById(decoded.id)
        .select("-password -confirmEmail -wishlist")
        .lean();

      if (!user) {
        throw new Error("User not found");
      }

      user.socketId = socketId;

      await redis.hset(`user-${user._id}`, user);
      await redis.expire(`user-${user._id}`, 900);
    } else {
      await redis.hset(`user-${decoded.id}`, "socketId", socketId);
      await redis.expire(`user-${decoded.id}`, 900);
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error.message);
    throw new Error("Authentication failed");
  }
};
