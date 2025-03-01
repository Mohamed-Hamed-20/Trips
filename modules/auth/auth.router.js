import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { signUpValidation } from "./auth.validation.js";
import * as registerControl from "./controller/auth.controller.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Auth Module" });
});

router.post("/signup", validation(signUpValidation), registerControl.signUp);
router.get("/confirmEmail/:token", registerControl.confirmEmail);
router.post("/login", registerControl.logIn);
router.post("/getCode", registerControl.sendCode);
router.post("/forgetPassword", registerControl.forgetPassword);



export default router;
