import jwt from "jsonwebtoken";
import userModel from "../DB/model/user.model.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../config/.env") });

export const hadleToken = async ({ token }) => {
  try {
    const tokenValue = token;
    const decoded = jwt.verify(tokenValue, process.env.tokenSignature);

    if (!decoded?.id || !decoded?.isLoggedIn) {
      throw new Error("Invalid token payload");
    }

    const user = await userModel
      .findById(decoded.id)
      .select("email userName role");
    if (!user) {
      throw new Error("Please login first");
    }
    
    return user;
  } catch (error) {
    console.error("Auth error:", error.message);
    throw new Error(error.message);
  }
};
