import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./controller/wishlist.controller.js";
import { auth } from "../../middleware/auth.js";

const wishlistRoutes = express.Router();

wishlistRoutes.get("/wishlist", auth(), getWishlist);
wishlistRoutes.post("/wishlist/:tripId", auth(), addToWishlist);
wishlistRoutes.delete("/wishlist/:tripId", auth(), removeFromWishlist);

export default wishlistRoutes;