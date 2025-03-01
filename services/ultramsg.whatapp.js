import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.instanceId);

const instanceIdWhatApp = process.env.instanceIdWhatApp;
const tokenWhatApp = process.env.tokenWhatApp;

const sendMessage = async (booking) => {
  try {
    console.log({ messgae: "from send msg", booking });

    const response = await axios.post(
      `https://api.ultramsg.com/${instanceIdWhatApp}/messages/chat`,
      {
        token: tokenWhatApp,
        to: booking.phone,
        body: `hello ${booking?.name} don't forget you trip its in ${booking?.departureDate}`,
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
