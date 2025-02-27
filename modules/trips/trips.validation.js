import Joi from "joi";

export const addTripSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().trim(),
  imageCover: Joi.array().items(Joi.string().required()),
  images: Joi.array().items(Joi.string().required()).required(),
  description: Joi.string().trim().max(500).optional(),
  destination: Joi.string().trim().required(),
  departureDate: Joi.date().required().min("now"),
  returnDate: Joi.date()
    .optional()
    .min(Joi.ref("departureDate"))
    .messages({ "date.min": "Return date must be after departure date." }),
  price: Joi.number().min(0).required(),
  availableSeats: Joi.number().min(0).required(),
  organizer: Joi.string().hex().length(24).required(),
});

export const getByIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const updateTripSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  title: Joi.string().min(3).max(100).trim().optional(),
  description: Joi.string().trim().max(500).optional(),
  destination: Joi.string().trim().optional(),
  departureDate: Joi.date().min("now").optional(),
  returnDate: Joi.date()
    .optional()
    .when("departureDate", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("departureDate")),
    })
    .messages({ "date.min": "Return date must be after departure date." }),
  price: Joi.number().min(0).optional(),
  availableSeats: Joi.number().min(0).optional(),
  imageCover: Joi.array().items(Joi.string().required()).optional(),
  images: Joi.array().items(Joi.string().required()).optional(),
});