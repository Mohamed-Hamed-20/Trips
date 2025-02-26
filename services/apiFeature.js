import { paginate } from "./pagination.js";

export default class ApiPipeline {
  constructor() {
    this.pipeline = [];
  }

  match({ fields, search, op }) {
    if (!search) return this;
    const searchQuery = fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
    this.pipeline.push({ $match: { [op]: searchQuery } });
    return this;
  }

  sort(sortText) {
    if (!sortText) return this;
    const sortFields = {};
    sortText.split(",").forEach((item) => {
      const [field, order] = item.split(":");
      sortFields[field.trim()] =
        order && order.trim().toLowerCase() === "desc" ? -1 : 1;
    });
    this.pipeline.push({ $sort: sortFields });
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

  build() {
    return this.pipeline;
  }
}
