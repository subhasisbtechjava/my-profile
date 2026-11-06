const Attendee = require("../models/attendee.model");
const Event = require("../../event/models/event.model");
const User = require("../../authentication/models/user.model");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const { sendSuccess, sendError } = require("../../../utils/apiResponse");
const { sequelize } = require("../../../config/db.config");

// Register / RSVP for an event
exports.registerForEvent = asyncErrorHandler(async (req, res) => {
  const { event_id, ticket_count = 1, notes } = req.body;
  const user_id = req.user.id;

  // Use managed transaction to prevent race conditions on capacity
  const result = await sequelize.transaction(async (t) => {
    const event = await Event.findByPk(event_id, { transaction: t, lock: true });
    if (!event) {
      throw new Error("EVENT_NOT_FOUND");
    }

    if (event.status !== "published") {
      throw new Error("EVENT_NOT_ACTIVE");
    }

    // Check capacity
    const availableSeats = event.capacity - event.registered_count;
    if (availableSeats < ticket_count) {
      throw new Error("CAPACITY_EXCEEDED");
    }

    // Check if user already booked this event
    const existingBooking = await Attendee.findOne({
      where: { event_id, user_id, status: "confirmed" },
      transaction: t,
    });
    if (existingBooking) {
      throw new Error("ALREADY_BOOKED");
    }

    const totalPrice = (parseFloat(event.ticket_price) || 0) * ticket_count;
    const paymentStatus = totalPrice > 0 ? "completed" : "free";

    const attendee = await Attendee.create(
      {
        event_id,
        user_id,
        ticket_count,
        total_price: totalPrice,
        status: "confirmed",
        payment_status: paymentStatus,
        notes,
      },
      { transaction: t }
    );

    // Update event registered count
    await event.increment("registered_count", { by: ticket_count, transaction: t });

    return attendee;
  });

  return sendSuccess(res, "Registered for event successfully", result, 201);
});

// Get logged-in user's bookings
exports.getMyBookings = asyncErrorHandler(async (req, res) => {
  const bookings = await Attendee.findAll({
    where: { user_id: req.user.id },
    include: [
      {
        model: Event,
        as: "event",
        include: [
          {
            model: User,
            as: "organizer",
            attributes: ["id", "name", "email", "phone"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return sendSuccess(res, "Bookings retrieved successfully", bookings);
});

// Get attendees for an event (Organizer or Admin)
exports.getEventAttendees = asyncErrorHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findByPk(eventId);
  if (!event) {
    return sendError(res, "Event not found", 404);
  }

  if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
    return sendError(res, "You do not have permission to view attendees for this event", 403);
  }

  const attendees = await Attendee.findAll({
    where: { event_id: eventId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "phone", "avatar"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return sendSuccess(res, "Event attendees fetched successfully", {
    event: {
      id: event.id,
      title: event.title,
      capacity: event.capacity,
      registered_count: event.registered_count,
    },
    attendees,
  });
});

// Cancel a booking
exports.cancelBooking = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  await sequelize.transaction(async (t) => {
    const booking = await Attendee.findByPk(id, { transaction: t });
    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }

    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return sendError(res, "You do not have permission to cancel this booking", 403);
    }

    if (booking.status === "cancelled") {
      return sendError(res, "Booking is already cancelled", 400);
    }

    booking.status = "cancelled";
    if (booking.payment_status === "completed") {
      booking.payment_status = "refunded";
    }
    await booking.save({ transaction: t });

    // Decrement event registered count
    const event = await Event.findByPk(booking.event_id, { transaction: t });
    if (event && event.registered_count >= booking.ticket_count) {
      await event.decrement("registered_count", { by: booking.ticket_count, transaction: t });
    }

    return sendSuccess(res, "Booking cancelled successfully", booking);
  });
});
