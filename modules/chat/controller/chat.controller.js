import chatModel from "../../../DB/model/chat.model.js";
import userModel from "../../../DB/model/user.model.js";

export const createChat = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.query;

    const resiver = await userModel.findById(receiverId);

    if (!resiver) return next(new Error("invaild receiverId", { cause: 404 }));

    const participants = [senderId, receiverId];
    let chat = await chatModel.findOne({
      participants: { $all: participants, $size: participants.length },
    });
    if (!chat) {
      chat = await chatModel.create({ participants: [senderId, receiverId] });
    }
    return res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findById(chatId).populate("participants");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const isUserIn = chat.participants.find((user) => {
      return user._id.toString() == req.user._id.toString();
    });

    if (!isUserIn) {
      return next(new Error("not allow to view this chat", { cause: 401 }));
    }

    return res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
