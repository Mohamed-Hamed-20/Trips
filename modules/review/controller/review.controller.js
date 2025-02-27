import reviewModel from "../../../DB/model/review.model.js";
import tripModel from "../../../DB/model/trip.model.js";

export const getReviews = async (req, res) => {
  try {
    const { tripId } = req.params;
    const reviews = await reviewModel.find({ trip: tripId }).populate("user");
    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this trip" });
    }    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rating, comment } = req.body;
    const { userId } = req;

    const trip = await tripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "trip not found" });
    }

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    const existingReview = await reviewModel.findOne({
      user: userId,
      trip: tripId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this trip" });
    }

    const newReview = new reviewModel({
      user: userId,
      trip: tripId,
      rating,
      comment,
    });

    await newReview.save();

    trip.reviews.push(newReview._id);
    await trip.save();

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const { userId } = req;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "review not found" });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await review.deleteOne();

    const trip = await tripModel.findById(review.trip);
    if (trip) {
      trip.reviews.pull(reviewId);
      await trip.save();
    }

    res.json({ message: "reviewModel deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
