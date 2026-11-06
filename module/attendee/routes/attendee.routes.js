const router = require("express").Router();
const attendeeController = require("../controllers/attendee.controller");
const validate = require("../../../middlewares/validate");
const { authenticateUser } = require("../../../middlewares/authenticateUser");
const { registerAttendeeSchema } = require("../validations/attendee.validation");

/**
 * @swagger
 * /api/v1/attendees/register:
 *   post:
 *     summary: Register / Book tickets for an event
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_id]
 *             properties:
 *               event_id:
 *                 type: integer
 *               ticket_count:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post(
  "/register",
  authenticateUser,
  validate(registerAttendeeSchema),
  attendeeController.registerForEvent
);

/**
 * @swagger
 * /api/v1/attendees/my-bookings:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/my-bookings", authenticateUser, attendeeController.getMyBookings);

/**
 * @swagger
 * /api/v1/attendees/event/{eventId}:
 *   get:
 *     summary: Get all attendees for a specific event (Organizer/Admin only)
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event attendees list
 */
router.get("/event/:eventId", authenticateUser, attendeeController.getEventAttendees);

/**
 * @swagger
 * /api/v1/attendees/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put("/:id/cancel", authenticateUser, attendeeController.cancelBooking);

module.exports = router;
