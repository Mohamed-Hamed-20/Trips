import mongoose, { Schema } from "mongoose";
const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "user", required: true },
    ],
    lastMessage: {
      content: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "user" },
      createdAt: { type: Date },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
conversationSchema.index({ participants: 1 });
conversationSchema.index({ "lastMessage.sender": 1 });
conversationSchema.index({ "lastMessage.createdAt": 1 });

const conversationModel = mongoose.model("Conversation", conversationSchema);

export default conversationModel;
