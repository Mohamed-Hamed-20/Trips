import userModel from "../../../DB/model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../services/email.js";
import { asyncHandler } from "../../../services/asyncHandler.js";
import { findOne, findOneAndUpdate } from "../../../DB/DBMethods.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await findOne({
      model: userModel,
      condition: { email },
      select: "email",
    });
    if (user) {
      next(new Error("This email already registered", { cause: 409 }));
    } else {
      let hashedPassword = bcrypt.hashSync(
        password,
        parseInt(process.env.SALTROUND)
      );
      let addUser = new userModel({
        name,
        email,
        password: hashedPassword,
      });

      let token = jwt.sign(
        { id: addUser._id, isLoggedIn: true },
        process.env.emailToken,
        { expiresIn: 60 * 60 }
      );
      let link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;

      let emailTemplatePath = path.join(__dirname, "./email.html");
      let emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
      emailTemplate = emailTemplate.replace("{{link}}", link);

      let result = await sendEmail(email, "Verify Your Email", emailTemplate);

      if (result.accepted.length) {
        let savedUser = await addUser.save();
        res.status(201).json({ message: "Success", savedUser });
      } else {
        next(new Error("Invalid email", { cause: 404 }));
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "catch error",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const confirmEmail = async (req, res, next) => {
  try {
    let { token } = req.params;
    let decoded = jwt.verify(token, process.env.emailToken);
    if (!decoded && !decoded.id) {
      return res.sendFile(path.join(__dirname, "email-failed.html"));
    } else {
      let updatedUser = await findOneAndUpdate({
        model: userModel,
        condition: { _id: decoded.id, confirmEmail: false },
        data: { confirmEmail: true },
        options: { new: true },
      });
      if (updatedUser) {
        return res.sendFile(path.join(__dirname, "email-success.html"));
      } else {
        return res.redirect("https://www.google.com/");
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "catch error",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne({ model: userModel, condition: { email } });
  if (!user) {
    next(new Error("You have to register first", { cause: 404 }));
  } else {
    let matched = bcrypt.compareSync(
      password,
      user.password,
      parseInt(process.env.SALTROUND)
    );
    if (matched) {
      if (!user.confirmEmail) {
        next(new Error("You have to confirm ur email first", { cause: 400 }));
      } else {
        let token = jwt.sign(
          { id: user._id, isLoggedIn: true },
          process.env.tokenSignature,
          { expiresIn: 60 * 60 * 60 * 24 * 2 }
        );
        res.status(200).json({ message: "Success", token });
      }
    } else {
      next(new Error("Password don't match", { cause: 400 }));
    }
  }
});
