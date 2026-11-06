const { Op } = require("sequelize");
const Event = require("../models/event.model");
const User = require("../../authentication/models/user.model");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const { sendSuccess, sendError } = require("../../../utils/apiResponse");

// Create a new event
exports.createEvent = asyncErrorHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    organizer_id: req.user.id,
  };

  const newEvent = await Event.create(eventData);

  return sendSuccess(res, "Event created successfully", newEvent, 201);
});

// Get all events with filtering, search, and pagination
exports.getAllEvents = asyncErrorHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    city,
    status = "published",
    startDate,
    endDate,
  } = req.query;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const where = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (category) {
    where.category = { [Op.iLike]: `%${category}%` };
  }

  if (city) {
    where.city = { [Op.iLike]: `%${city}%` };
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { venue_name: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (startDate) {
    where.start_time = {
      ...(where.start_time || {}),
      [Op.gte]: new Date(startDate),
    };
  }

  if (endDate) {
    where.end_time = {
      ...(where.end_time || {}),
      [Op.lte]: new Date(endDate),
    };
  }

  const { count, rows: events } = await Event.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [["start_time", "ASC"]],
    include: [
      {
        model: User,
        as: "organizer",
        attributes: ["id", "name", "email", "phone", "avatar"],
      },
    ],
  });

  return sendSuccess(res, "Events fetched successfully", {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page, 10),
    events,
  });
});

// Get single event by ID
exports.getEventById = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByPk(id, {
    include: [
      {
        model: User,
        as: "organizer",
        attributes: ["id", "name", "email", "phone", "avatar"],
      },
    ],
  });

  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  return sendSuccess(res, "Event fetched successfully", event);
});

// Update event
exports.updateEvent = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByPk(id);

  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  // Only the organizer who created it or an admin can update
  if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
    return sendError(res, "You do not have permission to modify this event", 403);
  }

  await event.update(req.body);

  return sendSuccess(res, "Event updated successfully", event);
});

// Delete event
exports.deleteEvent = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByPk(id);

  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
    return sendError(res, "You do not have permission to delete this event", 403);
  }

  await event.destroy();

  return sendSuccess(res, "Event deleted successfully");
});

// Get events created by logged-in user
exports.getMyOrganizedEvents = asyncErrorHandler(async (req, res) => {
  const events = await Event.findAll({
    where: { organizer_id: req.user.id },
    order: [["created_at", "DESC"]],
  });

  return sendSuccess(res, "Organized events fetched successfully", events);
});
