import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { changePassValidation } from "../auth/auth.validation.js";
import { changePassword, deleteAccount } from "./profile.controller.js";
import { auth } from "../../middleware/auth.js";

const profileRoutes = Router();

profileRoutes.patch("/profile/changePass" , validation(changePassValidation) , auth() , changePassword)
profileRoutes.delete("/profile/deleteAccount" , auth() , deleteAccount)

export default profileRoutes;
