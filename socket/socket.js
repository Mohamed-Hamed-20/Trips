import { Server as SocketIOServer } from "socket.io";
import messageModel from "../DB/model/message.model.js";
import chatModel from "../DB/model/chat.model.js";
import { hadleToken } from "../services/hadleToken.js";

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

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle join event
    socket.on("join", async (token) => {
      await handleJoin(socket, token);
    });

    // Handle send_message event
    socket.on("send_message", async (data) => {
      await handleSendMessage(io, socket, data);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
      console.log({ dont: "dont play with me" });

      handleDisconnect(socket);
    });
  });

  return io;
};

/**
 * Handles the join event:
 * - Decodes the token and authenticates the user.
 * - Stores the user data in the socket.
 * - Adds the user to a room identified by their user ID.
 */
const handleJoin = async (socket, token) => {
  try {
    const user = await hadleToken(token);
    if (!user?._id) {
      socket.emit("error", { message: "Authentication failed" });
      return;
    }
    socket.user = user;
    socket.join(user._id);
    rooms.push({ userId: user._id, socketId: socket.id });
    socket.emit("logged_success", {
      message: "User logged in and joined room",
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
 * - Retrieves an existing chat or creates a new one if chatId is not provided or not found.
 * - Checks that the sender and receiver are participants of the chat.
 * - Creates and saves the message.
 * - Emits the message to the receiver if they are connected.
 */
const handleSendMessage = async (io, socket, data) => {
  try {
    const { content, receiverId } = data;

    console.log({ content, receiverId });

    const user = socket.user;
    if (!user?._id) {
      socket.emit("error", { message: "User not authenticated" });
      return;
    }

    let chat = await chatModel.findOne({
      participants: { $all: [receiverId, user._id] },
    });

    if (!chat) {
      chat = await chatModel.create({
        participants: [receiverId, user._id],
      });
    }

    const newMessage = await messageModel.create({
      chatId: chat._id,
      sender: user._id,
      content: content,
    });
    console.log({ rooms });

    // Emit the message to the receiver if their room exists
    // console.log(io.sock);

    const connectedSocketIds = Array.from(io.sockets.sockets.keys());
    console.log("Connected socket IDs:", connectedSocketIds);

    // Get all rooms
    // const rooms123 = io.sockets.adapter.rooms;
    // for (const [roomName, room] of rooms123) {
    //   console.log(`Room: ${roomName} has members:`, Array.from(room));
    // }
    // console.log({ receiverId });

    // if (io.sockets.adapter.rooms.get(receiverId.toString())) {

    // io.to(receiverId).emit("receive_message", newMessage);

    console.log({ hi: "jiصييشيشسيشسيشيس" });
    console.log({ rooms });

    console.log({ receiverId: receiverId.toString() });

    const userinfo = rooms.find((room) => {
      return room.userId.toString() == receiverId.toString();
    });

    console.log({ userinfo });
    // send by socket id
    
    // send by room name 

    //room name



    io.to(userinfo.socketId).emit("receive_message", newMessage);
    // }
  } catch (error) {
    socket.emit("error", { message: error.message });
    console.error("Error in send_message handler:", error);
  }
};

/**
 * Handles the disconnect event:
 * - Removes the disconnected socket from the rooms array.
 */
const handleDisconnect = (socket) => {
  rooms = rooms.filter((user) => user.socketId !== socket.id);
  console.log("User disconnected:", socket.id);
};
