import Joi from "joi";
import { Types } from "mongoose";
import { paginate } from "./pagination.js";

const matchSchema = Joi.object({
  fields: Joi.array().items(Joi.string()).min(1).required(),
  search: Joi.string().allow("", null),
  op: Joi.string().valid("$or", "$and").required(),
});

const sortSchema = Joi.string().pattern(
  /^\s*\w+:(asc|desc)(\s*,\s*\w+:(asc|desc))*\s*$/i
);

export default class ApiPipeline {
  constructor() {
    this.pipeline = [];
  }

  match({ fields, search, op }) {
    const { error, value } = matchSchema.validate({ fields, search, op });
    if (error) {
      throw new Error(`Validation error in match: ${error.message}`);
    }
    const { fields: validFields, search: validSearch, op: validOp } = value;
    if (!validSearch) return this;
    const searchQuery = validFields.map((field) => ({
      [field]: { $regex: validSearch, $options: "i" },
    }));
    this.pipeline.push({ $match: { [validOp]: searchQuery } });
    return this;
  }

  sort(sortText) {
    if (!sortText) return this;

    const { error } = sortSchema.validate(sortText);
    if (error) {
      throw new Error(`Invalid sort parameter: ${error.message}`);
    }

    const sortFields = {};
    sortText.split(",").forEach((item) => {
      const [field, order] = item.split(":");
      sortFields[field.trim()] = order.trim().toLowerCase() === "desc" ? -1 : 1;
    });

    this.pipeline.push({ $sort: sortFields });
    return this;
  }

  matchId({ Id, field }) {
    if (!Id) return this;
    if (!Types.ObjectId.isValid(Id)) {
      throw new Error("Invalid ObjectId");
    }
    this.pipeline.push({ $match: { [field]: Types.ObjectId(Id) } });
    return this;
  }

  lookUp({ from, localField, foreignField, as }) {
    this.pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    });
    return this;
  }

  projection({ allowFields, select }) {
    if (!select) select = allowFields.join(",");
    const fieldWanted = select
      .split(",")
      .map((f) => f.trim())
      .filter((field) => allowFields.includes(field));

    if (fieldWanted.length > 0) {
      const projection = fieldWanted.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});
      this.pipeline.push({ $project: projection });
    }
    return this;
  }

  paginate(page, size) {
    const { limit, skip } = paginate(page, size);
    this.pipeline.push({ $skip: skip });
    this.pipeline.push({ $limit: limit });
    return this;
  }

  addStage(stage) {
    if (typeof stage !== "object" || Array.isArray(stage)) {
      throw new Error("Stage must be a valid object");
    }
    this.pipeline.push(stage);
    return this;
  }

  build() {
    return this.pipeline;
  }
}
