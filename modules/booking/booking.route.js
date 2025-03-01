import { Router } from "express";
import * as bookingController from "./controller/booking.controller.js";
import { auth } from "../../middleware/auth.js";

const router = Router();

router.post("/add", auth(), bookingController.createBooking);
router.get("/:userId", bookingController.getBookingsByUser);
router.put("/:id", auth(), bookingController.updateBookingStatus);
router.delete("/:id", auth(), bookingController.deleteBooking);

export default router;
