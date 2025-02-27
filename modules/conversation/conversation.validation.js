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

export const queryValidationSchema = joi
  .object({
    search: joi.string().allow("", null).trim(),

    sort: joi
      .string()
      .pattern(/^\s*\w+:(asc|desc)(\s*,\s*\w+:(asc|desc))*\s*$/i)
      .messages({
        "string.pattern.base":
          "Sort must be in the format 'field:asc,field2:desc'",
      })
      .allow("", null),

    select: joi
      .string()
      .pattern(/^\s*\w+(\s*,\s*\w+)*\s*$/)
      .messages({
        "string.pattern.base":
          "Select must be a comma-separated list of fields",
      })
      .allow("", null),

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
  .unknown(true);
