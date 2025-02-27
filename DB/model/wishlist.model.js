import { model, Schema, Types } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripId: {
      type: Types.ObjectId,
      ref: "Trip",
      required: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, tripId: 1 }, { unique: true });

const wishlistModel = model("Wishlist", wishlistSchema);

export default wishlistModel;
