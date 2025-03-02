import { Schema, model, Types } from "mongoose";

const tripSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    departureDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Departure date must be in the future.",
      },
    },
    returnDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.departureDate || value > this.departureDate;
        },
        message: "Return date must be after the departure date.",
      },
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive value."],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative."],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, 'CategoryId is required']
  },
    reviews: [
      {
        type: Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const tripModel = model("Trip", tripSchema);

export default tripModel;
