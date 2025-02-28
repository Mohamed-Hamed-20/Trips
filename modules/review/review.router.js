import express from "express";
import {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} from "./controller/review.controller.js";
import { auth, roles } from "../../middleware/auth.js";

const reviewRoutes = express.Router();
reviewRoutes.get("/trip/:tripId", getReviews); // Fetch reviews for a trip
reviewRoutes.post("/trip/:tripId", auth(), addReview); // Add a review for a trip
reviewRoutes.put("/:reviewId", auth(), updateReview); // Update a review
reviewRoutes.delete("/:reviewId", auth(), deleteReview); // Delete a review

export default reviewRoutes;
