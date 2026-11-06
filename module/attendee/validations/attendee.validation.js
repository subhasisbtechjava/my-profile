const Joi = require("joi");

const registerAttendeeSchema = Joi.object({
  event_id: Joi.number().integer().required(),
  ticket_count: Joi.number().integer().min(1).max(20).default(1),
  notes: Joi.string().allow("", null).optional(),
});

const updateAttendeeStatusSchema = Joi.object({
  status: Joi.string().valid("confirmed", "cancelled", "waitlist").optional(),
  payment_status: Joi.string().valid("pending", "completed", "refunded", "free").optional(),
});

module.exports = {
  registerAttendeeSchema,
  updateAttendeeStatusSchema,
};
