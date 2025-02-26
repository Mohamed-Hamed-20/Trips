import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const messageModel = model("message", messageSchema);
export default messageModel;
