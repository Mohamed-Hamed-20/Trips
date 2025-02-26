import conversationModel from "../../../DB/model/conversation.model.js";
import userModel from "../../../DB/model/user.model.js";

export const createconversation = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.query;

    const resiver = await userModel.findById(receiverId);

    if (!resiver) return next(new Error("invaild receiverId", { cause: 404 }));

    const participants = [senderId, receiverId];
    let conversation = await conversationModel.findOne({
      participants: { $all: participants, $size: participants.length },
    });
    if (!conversation) {
      conversation = await conversationModel.create({
        participants: [senderId, receiverId],
      });
    }
    return res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const getconversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await conversationModel
      .findById(conversationId)
      .populate("participants");
    if (!conversation)
      return res.status(404).json({ message: "conversation not found" });
    const isUserIn = conversation.participants.find((user) => {
      return user._id.toString() == req.user._id.toString();
    });

    if (!isUserIn) {
      return next(
        new Error("not allow to view this conversation", { cause: 401 })
      );
    }

    return res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
