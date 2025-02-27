import userModel from "../../../DB/model/user.model.js";
import wishlistModel from "../../../DB/model/wishlist.model.js";

export const getWishlist = async (req, res, next) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const items = await wishlistModel.find({ userId }).populate("tripId");
    res.json({ wishlist: items });
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

    const existingTrip = await wishlistModel.findOne({ tripId, userId });
    if (existingTrip) {
      return res.status(400).json({ message: "Trip already in wishlist." });
    }

    let newTrip = await wishlistModel.create({ tripId, userId });
    newTrip = await newTrip.populate("tripId");

    const user = await userModel.findById(userId)
    if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

    user.wishlist.push(newTrip._id)

    await user.save()

    res.status(201).json(newTrip);
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { userId } = req;
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required." });
    }

    const deletedTrip = await wishlistModel.findOneAndDelete({ tripId, userId });
    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found in wishlist." });
    }

    const user = await userModel.findById(userId)

    if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

    user.wishlist.pull(deletedTrip._id)
    
    await user.save()
    res.json({ message: "Trip removed successfully!" });
  } catch (err) {
    next(err);
  }
};
