import jwt from "jsonwebtoken";
import userModel from "../DB/model/user.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
export const roles = {
  User: "User",
  Admin: "Admin",
  Traveler: "Traveler",
};

export const auth = (
  acceptRoles = [roles.User, roles.Admin, roles.Traveler]
) => {
  return asyncHandler(async (req, res, next) => {
    console.log({ bb: req.body });
    const { authorization } = req.headers;
    if (!authorization?.startsWith("Bearer")) {
      // res.status(400).json({ message: "In-valid Bearer key" })
      next(new Error("Invalid Bearer key", { cause: 400 }));
    } else {
      const token = authorization.split(" ")[1];
      console.log(token);
      
      const decoded = jwt.verify(token, process.env.tokenSignature);
      if (!decoded?.id || !decoded?.isLoggedIn) {
        next(new Error("Invalid token payload ", { cause: 400 }));
      } else {
        let userString = await redis.get(`user-${decoded.id}`);
        let user = JSON.parse(userString);

        if (!user) {
          user = await userModel
            .findById(decoded.id)
            .select("email userName role");
          const userKey = `user-${user._id}`;
          await redis.set(userKey, JSON.stringify(user));
          await redis.expire(userKey, 900);
        }

        if (!user) {
          next(new Error("Not register user ", { cause: 404 }));
        } else {
          if (acceptRoles.includes(user.role)) {
            req.user = user;
            req.userId = user.id;
            next();
          } else {
            next(new Error("Not authorized user ", { cause: 403 }));
          }
        }
      }
    }
  });
};