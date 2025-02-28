import userModel from "../../../DB/model/user.model.js";
import ApiPipeline from "../../../services/apiFeature.js";

export const allowUserFields = [
  "name",
  "email",
  "phone",
  "role",
  "image",
  "lastSeen",
  "Trips",
];

export const searchUsers = async (req, res, next) => {
  const { search, sort, select, page, size } = req.query;

  const pipeline = new ApiPipeline()
    .match({ fields: ["name", "role", "email"], search, op: "$or" })
    .paginate(page, size)
    .lookUp({
      from: "trip",
      localField: "wishlist",
      foreignField: "_id",
      as: "Trips",
    })
    .sort(sort)
    .projection({
      allowFields: allowUserFields,
      select,
      defultFields: allowUserFields,
    })
    .build();

  const users = await userModel.aggregate(pipeline);

  return res
    .status(200)
    .json({ message: "found success", success: true, users });
};
