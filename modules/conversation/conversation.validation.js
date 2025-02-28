import joi from "joi";

const jwtRegex = /^Bearer\s[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
export const createconversationValidation = {};

export const tokenValidation = {
  headers: joi
    .object({
      authorization: joi.string().pattern(jwtRegex).required().messages({
        "string.pattern.base":
          "Authorization token must start with 'Bearer ' followed by a valid JWT",
        "any.required": "Authorization token is required",
      }),
    })
    .unknown(true)
    .required(),
};

export const createSortSchema = (allowedFields) => {
  return joi
    .string()
    .custom((value, helpers) => {
      if (!value) return value;

      const sortParts = value.split(",").map((part) => part.trim());
      for (const part of sortParts) {
        const [field, order] = part.split(":");
        if (!allowedFields.includes(field)) {
          return helpers.error("any.invalid", {
            message: `Invalid field '${field}' in sort`,
          });
        }
        if (!["asc", "desc"].includes(order?.toLowerCase())) {
          return helpers.error("any.invalid", {
            message: `Invalid order '${order}' for field '${field}' must be asc , desc`,
          });
        }
      }

      return value;
    })
    .messages({
      "any.invalid": "{{#message}}",
    })
    .allow("", null);
};

export const createSelectSchema = (allowedFields) => {
  return joi
    .string()
    .custom((value, helpers) => {
      if (!value) return value;

      if (
        value.includes(",,") ||
        value.startsWith(",") ||
        value.endsWith(",")
      ) {
        return helpers.error("any.invalid", {
          message: `Invalid format in select: '${value}'`,
        });
      }

      const selectedFields = value.split(",").map((field) => field.trim());

      for (const field of selectedFields) {
        if (!allowedFields.includes(field)) {
          return helpers.error("any.invalid", {
            message: `Invalid field '${field}' in select`,
          });
        }
      }

      return value;
    })
    .messages({
      "any.invalid": "{{#message}}",
    })
    .allow("", null);
};

export const queryValidationSchema = (allowFields) => {
  return {
    query: joi
      .object({
        search: joi.string().allow("", null).trim(),
        sort: createSortSchema(allowFields),

        select: createSelectSchema(allowFields),

        page: joi.number().integer().min(1).messages({
          "number.base": "Page must be a number",
          "number.integer": "Page must be an integer",
          "number.min": "Page must be greater than or equal to 1",
        }),

        size: joi.number().integer().min(1).max(100).messages({
          "number.base": "Size must be a number",
          "number.integer": "Size must be an integer",
          "number.min": "Size must be at least 1",
          "number.max": "Size cannot be more than 100",
        }),
      })
      .unknown(true),
  };
};
