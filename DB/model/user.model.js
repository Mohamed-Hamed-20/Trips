import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      min: [2, "minimum length 2 char"],
      max: [20, "max length 20 char"],
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "Traveler",
      enum: ["Traveler", "Guide"],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    image: String,
    Wishlist: [
      {
        type: Types.ObjectId,
        ref: "Trip",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = model("User", userSchema);
export default userModel;
