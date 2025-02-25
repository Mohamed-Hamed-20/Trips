import chatModel from "../../../DB/model/chat.model.js";
import messageModel from "../../../DB/model/message.model.js";

export const getHistory = async (req, res, next) => {
  try {
    const { chatId } = req.query;
    const user = req.user;
    const chat = await chatModel.findById(chatId);

    if (!chat) {
      return next(new Error("Invalid chatId", { cause: 404 }));
    }

    if (!chat.participants.includes(user._id)) {
      return next(
        new Error("Not allow to view this conversation", { cause: 401 })
      );
    }

    const messages = await messageModel
      .find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .skip(0);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const lastchats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const recentChats = await messageModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("sender", "userName email")
      .populate("receiver", "userName email")
      .lean();

    const chatMap = new Map();
    recentChats.forEach((msg) => {
      const chatPartner =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      if (!chatMap.has(chatPartner._id.toString())) {
        chatMap.set(chatPartner._id.toString(), {
          chatId: msg.chatId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          user: {
            id: chatPartner._id,
            userName: chatPartner.userName,
            email: chatPartner.email,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      recentChats: Array.from(chatMap.values()),
    });
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
