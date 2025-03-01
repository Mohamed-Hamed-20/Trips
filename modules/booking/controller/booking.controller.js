import bookingModel from "../../../DB/model/booking.model.js";
import tripModel from "../../../DB/model/trip.model.js";

export const createBooking = async (req, res) => {
  try {
    const { tripId, numberOfPeople, totalPrice } = req.body;
    const userId = req.user?._id;

    const trip = await tripModel.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const booking = new bookingModel({
      userId,
      tripId,
      numberOfPeople,
      totalPrice,
    });
    await booking.save();
    res.status(201).json({ message: "Success", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ userId: req.params.userId })
      .populate("tripId");
    res.status(201).json({ message: "Success", bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update booking status (confirm or cancel)
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await bookingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    console.log(req.params.id, req.body);
    res.status(200).json({ message: "Success", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await bookingModel.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
