import jwt, {
  JsonWebTokenError,
  JwtPayload,
  Secret,
} from "jsonwebtoken";
import { CustomError } from "./errorHandling";
import mongoose from "mongoose";

export const generateToken = (
  payload,
  secretKey ,
  expiresIn 
) => {
  try {
    const token = jwt.sign(payload, secretKey, {
      expiresIn: expiresIn,
      audience: String(process.env.app_url),
      issuer: String(process.env.companyName),
      subject: String(process.env.Email || "mohamed@gmail.com"),
    });

    if (!token) throw new Error("Token generation failed");

    return token;
  } catch (error) {
    throw new CustomError(`Token generation failed: ${error?.message}`, 500);
  }
};

export const verifyToken = (token, secretKey) => {
  try {
    const payload = jwt.verify(token, secretKey) ;

    if (!payload) {
      throw new CustomError("Toksen verification failed: Invalid token", 400);
    }

    return payload;
  } catch (error) {
    throw process.env.NODE_ENV == "development"
      ? error
      : "Unknown error occurred during token verification";
  }
};
