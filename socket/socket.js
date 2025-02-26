import { Server as SocketIOServer } from "socket.io";
import messageModel from "../DB/model/message.model.js";
import conversationModel from "../DB/model/conversation.model.js";
import { handleToken } from "../services/hadleToken.js";
import redis from "../DB/redis.js";

// Tracking rooms if needed (you can also use Socket.IO's built-in adapter methods)
let rooms = [];

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

    // Handle send_message event
    socket.on("send_message", async (data) => {
      await handleSendMessage(io, socket, data);
    });

    // Handle disconnect event
    socket.on("disconnect", async () => {
      console.log(
        `user with Id ${socket.userId} and socketId ${socket.id} disconnect :(`
      );
      await handleDisconnect(socket);
    });
  });

  return io;
};

const isSocketConnected = (socketId) => {
  const socket = io.sockets.sockets.get(socketId);
  return socket ? socket.connected : false;
};

/**
 * Handles the join event:
 * - Decodes the token and authenticates the user.
 * - Stores the user data in the socket.
 * - Adds the user to a room identified by their user ID.
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
    console.log(`User ${user._id} joined room.`);
  } catch (error) {
    socket.emit("error", { message: "Error during authentication" });
    console.error("Error in join handler:", error);
  }
};

/**
 * Handles the send_message event:
 * - Validates the user stored in the socket.
 * - Retrieves an existing conversation or creates a new one if conversationId is not provided or not found.
 * - Checks that the sender and receiver are participants of the conversation.
 * - Creates and saves the message.
 * - Emits the message to the receiver if they are connected.
 */
const handleSendMessage = async (io, socket, data) => {
  try {
    const { content, receiverId, conversationId } = data;

    console.log({ content, receiverId });

    const userId = socket.userId;
    if (!userId) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    const lastMessage = { content, sender: userId, createdAt: Date.now() };
    let conversation = await conversationModel
      .findOneAndUpdate(
        {
          _id: conversationId,
          participants: { $all: [receiverId, user._id] },
        },
        { $set: { lastMessage } },
        { new: true }
      )
      .lean();

    if (!conversation) {
      const conversationValues = {
        participants: [userId, receiverId],
        lastMessage: { content, sender: userId, createdAt: Date.now() },
      };
      conversation = await conversationModel.create(conversationValues);
    }

    const newMessage = await messageModel.create({
      conversationId: conversation._id,
      sender: user._id,
      content: content,
    });

    // Emit the message to the receiver if their room exists
    const receiverSocketId = await redis.hget(`user-${userId}`, "socketId");
    if (receiverSocketId) {
      const isconnected = isSocketConnected(receiverSocketId);
      if (isconnected)
        return io.to(receiverSocketId).emit("receive_message", newMessage);
    }
    return;
  } catch (error) {
    socket.emit("error", { message: error.message });
    console.error("Error in send_message handler:", error);
  }
};

/**
 * Handles the disconnect event:
 * - Removes the disconnected socket from the rooms array.
 */
const handleDisconnect = async (socket) => {
  await redis.hdel(`user-${socket.userId}`, "socketId");
  console.log("User disconnected:", socket.id);
};
