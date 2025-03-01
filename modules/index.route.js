import authRouter from "./auth/auth.router.js";
import profileRoutes from "./profile/profile.router.js";
import conversationRoutes from "./conversation/conversation.routes.js";
import messageRoutes from "./message/message.routes.js";
import userRoutes from "./users/user.route.js";
import wishlistRoutes from "./wishlist/wishlist.router.js";
import reviewRoutes from "./review/review.router.js";
import tripRoutes from "./trips/trips.router.js";
import bookingRoutes from "./booking/booking.route.js";
import paymentRoutes from "../payment/payment.routes.js";

export {
  authRouter,
  profileRoutes,
  conversationRoutes,
  messageRoutes,
  userRoutes,
  wishlistRoutes,
  reviewRoutes,
  tripRoutes,
  paymentRoutes,
  bookingRoutes,
};
