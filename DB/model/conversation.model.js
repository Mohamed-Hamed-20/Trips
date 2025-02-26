import mongoose, { Schema } from "mongoose";
const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: {
      content: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const conversationModel = mongoose.model("Conversation", conversationSchema);

export default conversationModel;
