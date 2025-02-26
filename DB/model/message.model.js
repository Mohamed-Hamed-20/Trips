import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, default: "text" },
    isdelivered: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt" } }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
