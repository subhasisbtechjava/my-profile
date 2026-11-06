const Joi = require("joi");

const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().max(100).default("General"),
  venue_name: Joi.string().min(2).max(200).required(),
  address: Joi.string().allow("", null).optional(),
  city: Joi.string().max(100).allow("", null).optional(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref("start_time")).required().messages({
    "date.greater": "end_time must be later than start_time",
  }),
  capacity: Joi.number().integer().min(1).default(100),
  ticket_price: Joi.number().min(0).default(0.0),
  banner_image: Joi.string().uri().allow("", null).optional(),
  status: Joi.string().valid("draft", "published", "cancelled", "completed").default("published"),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().max(100).optional(),
  venue_name: Joi.string().min(2).max(200).optional(),
  address: Joi.string().allow("", null).optional(),
  city: Joi.string().max(100).allow("", null).optional(),
  start_time: Joi.date().iso().optional(),
  end_time: Joi.date().iso().optional(),
  capacity: Joi.number().integer().min(1).optional(),
  ticket_price: Joi.number().min(0).optional(),
  banner_image: Joi.string().uri().allow("", null).optional(),
  status: Joi.string().valid("draft", "published", "cancelled", "completed").optional(),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
};
