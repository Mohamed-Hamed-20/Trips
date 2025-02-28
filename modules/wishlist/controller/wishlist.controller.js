import tripModel from "../../../DB/model/trip.model.js";
import userModel from "../../../DB/model/user.model.js";

export const getWishlist = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await userModel.findById(userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { userId } = req;
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required." });
    }

    const trip = await tripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip doesn't exist." });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: tripId } }, 
      { new: true }
    ).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(201).json({ message: "Trip added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { userId } = req;
    const { tripId } = req.params;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: tripId } },
      { new: true }
    ).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found or Trip not in wishlist." });
    }

    res.json({ message: "Trip removed successfully!", wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
