import { Server as SocketIOServer } from "socket.io";
import messageModel from "../DB/model/message.model.js";
import conversationModel from "../DB/model/conversation.model.js";
import { handleToken } from "../services/hadleToken.js";
import redis from "../DB/redis.js";

const isSocketConnected = (io, socketId) => {
  const socket = io.sockets.sockets.get(socketId);
  return socket ? socket.connected : false;
};

export const initSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    socket.on("login", async (token) => {
      await handleJoin(socket, token);
    });

    socket.on("send_message", async (data) => {
      await handleSendMessage(io, socket, data);
    });

    socket.on("disconnect", async () => {
      console.log(
        `User with Id ${socket.userId} and socketId ${socket.id} disconnected`
      );
      await handleDisconnect(socket);
    });
  });

  return io;
};

/**
 * Handles the join event:
 * - Decodes the token and authenticates the user.
 * - Stores the user data in the socket.
 */
const handleJoin = async (socket, token) => {
  try {
    const user = await handleToken(token, socket.id);
    if (!user?._id) {
      socket.emit("error", { message: "Authentication failed" });
      return;
    }
    socket.userId = user._id;

    socket.emit("logged_success", {
      message: "User logged in",
    });
    console.log(`User ${user._id} logged in.`);
  } catch (error) {
    socket.emit("error", { message: "Error during authentication" });
    console.error("Error in join handler:", error);
  }
};

/**
 * Handles the send_message event:
 * - Ensures the user is authenticated.
 * - Retrieves or creates a conversation.
 * - Validates that sender and receiver are participants.
 * - Creates and saves the message.
 * - Emits the message to the receiver if connected.
 */
const handleSendMessage = async (io, socket, data) => {
  try {
    const { content, receiverId, conversationId } = data;
    const senderId = socket.userId;

    if (!senderId) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    const lastMessage = { content, sender: senderId, createdAt: Date.now() };

    let conversation = await conversationModel
      .findOneAndUpdate(
        {
          _id: conversationId,
          participants: { $all: [receiverId, senderId] },
        },
        { $set: { lastMessage } },
        { new: true }
      )
      .lean();

    if (!conversation) {
      const conversationValues = {
        participants: [senderId, receiverId],
        lastMessage: { content, sender: senderId, createdAt: Date.now() },
      };
      conversation = await conversationModel.create(conversationValues);
    }

    // إنشاء الرسالة
    const newMessage = await messageModel.create({
      conversationId: conversation._id,
      sender: senderId,
      content,
    });

    // استرجاع socketId للمستقبل من Redis
    const receiverSocketId = await redis.hget(`user-${receiverId}`, "socketId");
    if (receiverSocketId && isSocketConnected(io, receiverSocketId)) {
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }
  } catch (error) {
    socket.emit("error", { message: error.message });
    console.error("Error in send_message handler:", error);
  }
};

/**
 * Handles the disconnect event:
 * - Removes the socketId from Redis for the disconnected user.
 */
const handleDisconnect = async (socket) => {
  if (socket.userId) {
    await redis.hdel(`user-${socket.userId}`, "socketId");
    console.log("Removed socketId for user:", socket.userId);
  }
  console.log("User disconnected:", socket.id);
};
