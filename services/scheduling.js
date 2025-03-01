import bookingModel from "../DB/model/booking.model.js";
import cron from "node-cron";
import { sendBulkMessages } from "./ultramsg.whatapp.js";

export const sendReminderPhones = async () => {
  try {
    const today = new Date();
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(today.getDate() + 2);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Aggregation Pipeline
    const bookings = await bookingModel.aggregate([
      {
        $lookup: {
          from: "trips",
          localField: "tripId",
          foreignField: "_id",
          as: "trip",
        },
      },
      { $unwind: "$trip" },
      {
        $match: {
          "trip.departureDate": { $gte: tomorrowStart, $lte: tomorrowEnd },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          phone: "$user.phone",
          name: "$user.name",
          destination: "$trip.destination",
          departureDate: "$trip.departureDate",
        },
      },
    ]);

    if (!bookings.length) {
      console.log("No bookings for tomorrow's trips.");
      return;
    }

    const sendUsingWhatapp = await sendBulkMessages(bookings);
    console.log({ sendUsingWhatapp });

    return bookings;
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
};

export const run = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running scheduled task at midnight (12:00 AM)");

    const booking = await sendReminderPhones();
    console.log({ booking });
  });
};
