import userModel from "../../../DB/model/user.model.js";


export const searchUsers = async (req, res, next) => {
  const { search, sort, page, size, select } = req.query;
  const { limit, skip } = paginate(page, size);

  const pipeline = new ApiPipeline()
    .paginate(skip, limit)
    .projection({ allowFields: allowUserFields, select })
    .build();

  const users = await userModel.aggregate(pipeline);

  res.json(users);
};