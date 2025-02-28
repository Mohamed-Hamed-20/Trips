// =======
import jwt from "jsonwebtoken";
import userModel from "../DB/model/user.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
export const roles = {
  Admin: "Admin",
  User: "User",
  Organizer: "Organizer",
};

export const auth = (
  acceptRoles = [roles.User, roles.Admin, roles.Organizer]
) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith("Bearer")) {
      next(new Error("Invalid Bearer key", { cause: 400 }));
    } else {
      const token = authorization.split(process.env.BearerKey)[1];
      // const token = authorization.split()[1];
      const decoded = jwt.verify(token, process.env.tokenSignature);
      if (!decoded?.id || !decoded?.isLoggedIn) {
        next(new Error("Invalid token payload ", { cause: 400 }));
      } else {
        const user = await userModel
          .findById(decoded.id)
          .select("email userName role");
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
