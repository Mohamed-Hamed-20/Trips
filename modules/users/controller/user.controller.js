import userModel from "../../../DB/model/user.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await userModel
      .find({
        name: { $regex: q, $options: "i" },
      })
      .select("name email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
