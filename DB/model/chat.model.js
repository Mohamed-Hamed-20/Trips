import { Schema, model, Types } from "mongoose";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const chatModel = model("chat", chatSchema);
export default chatModel;
