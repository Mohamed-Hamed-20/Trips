import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const instanceIdWhatApp = process.env.instanceIdWhatApp;
const tokenWhatApp = process.env.tokenWhatApp;

const sendMessage = async (booking) => {
  try {
    console.log({ message: "from send msg", booking });

    const response = await axios.post(
      `https://api.ultramsg.com/${instanceIdWhatApp}/messages/chat`,
      {
        token: tokenWhatApp,
        to: booking.phone,
        body: `Hello ${booking?.name}! Don't forget your trip is in ${booking?.departureDate}. Get ready for an amazing experience! 🚀✨`,
      }
    );
    console.log(`📩 Sent to ${booking?.name}:`, response.data);
  } catch (error) {
    console.error(
      `❌ Error sending to ${booking?.phone}:`,
      error.response?.data || error
    );
  }
};

export const sendBulkMessages = async (bookings) => {
  for (const booking of bookings) {
    await sendMessage(booking);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
