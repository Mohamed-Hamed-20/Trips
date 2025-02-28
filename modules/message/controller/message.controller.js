import conversationModel from "../../../DB/model/conversation.model.js";
import messageModel from "../../../DB/model/message.model.js";
import ApiPipeline from "../../../services/apiFeature.js";

export const allowfieldMessages = [
  "conversationId",
  "createdAt",
  "updatedAt",
  "sender",
  "content",
  "type",
  "isdelivered",
  "isRead",
];

export const getHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.query;
    const user = req.user;
    const conversation = await conversationModel.findById(conversationId);

    if (!conversation) {
      return next(new Error("Invalid conversationId", { cause: 404 }));
    }

    if (!conversation.participants.includes(user._id)) {
      return next(
        new Error("Not allow to view this conversation", { cause: 401 })
      );
    }

    const messages = await messageModel
      .find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .skip(0);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const lastconversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const recentconversations = await messageModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("sender", "userName email")
      .populate("receiver", "userName email")
      .lean();

    const conversationMap = new Map();
    recentconversations.forEach((msg) => {
      const conversationPartner =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(conversationPartner._id.toString())) {
        conversationMap.set(conversationPartner._id.toString(), {
          conversationId: msg.conversationId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          user: {
            id: conversationPartner._id,
            userName: conversationPartner.userName,
            email: conversationPartner.email,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      recentconversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("Error fetching recent conversations:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, conversationId } = req.body;
    const userId = req.user._id;
    console.log({ userId, receiverId, content, conversationId });

    // التحقق من وجود جميع الحقول المطلوبة
    if (!receiverId || !content || !conversationId) {
      return next(new Error("Missing required fields", { cause: 400 }));
    }

    // جلب المحادثة بواسطة المعرف
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return next(new Error("Conversation not found", { cause: 404 }));
    }

    // التأكد من أن كل من المرسل والمستقبل موجودين ضمن المشاركين في المحادثة
    const participantIds = conversation.participants.map((user) =>
      user.toString()
    );
    if (
      !participantIds.includes(userId.toString()) ||
      !participantIds.includes(receiverId.toString())
    ) {
      return next(
        new Error(
          "User or receiver is not a participant in this conversation",
          { cause: 401 }
        )
      );
    }

    // إنشاء رسالة جديدة
    const newMessage = await messageModel.create({
      sender: userId,
      content,
      conversationId,
      readBy: [],
      deliveredTo: [],
    });

    // تحديث الحقل الخاص بآخر رسالة في المحادثة
    conversation.lastMessage = {
      content,
      createdAt: new Date(),
      sender: userId,
    };

    await conversation.save();

    return res.status(200).json({
      message: "Message created successfully",
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return next(new Error("Internal server error", { cause: 500 }));
  }
};

export const getMessages = async (req, res, next) => {
  const { conversationId } = req.query;
  const { sort, search, select, page, size } = req.query;
  const userId = req.user._id;

  const conversation = await conversationModel.findById(conversationId);

  if (!conversation) {
    return next(new Error("Invaild conversation Id", { cause: 400 }));
  }

  if (!conversation.participants.includes(userId)) {
    return next(
      new Error("not allow to view this conversation", { cause: 401 })
    );
  }

  const pipeline = new ApiPipeline()
    .matchId({
      Id: conversationId,
      field: "_id",
    })
    .match({
      fields: ["content"],
      op: "$or",
      search,
    })
    .sort(sort)
    .lookUp({
      from: "user",
      localField: "sender",
      foreignField: "_id",
      as: "sender",
    })
    .paginate(page, size)
    .projection({
      allowFields: allowfieldMessages,
      select,
    })
    .build();

  const messgaes = await messageModel.aggregate(pipeline);

  return res
    .status(200)
    .json({ message: "returned success", success: 200, data: messgaes });
};
