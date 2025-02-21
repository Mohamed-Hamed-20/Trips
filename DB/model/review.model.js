import { Schema, model, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, 
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500, 
    },
  },
  { timestamps: true }
);



const reviewModel = model("Review", reviewSchema);

export default reviewModel;
