const router = require("express").Router();
const eventController = require("../controllers/event.controller");
const validate = require("../../../middlewares/validate");
const { authenticateUser, authorizeRoles } = require("../../../middlewares/authenticateUser");
const {
  createEventSchema,
  updateEventSchema,
} = require("../validations/event.validation");

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all published events with filters
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", eventController.getAllEvents);

/**
 * @swagger
 * /api/v1/events/my/organized:
 *   get:
 *     summary: Get events organized by current user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organized events
 */
router.get("/my/organized", authenticateUser, eventController.getMyOrganizedEvents);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", eventController.getEventById);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, venue_name, start_time, end_time]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               venue_name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *               ticket_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  validate(createEventSchema),
  eventController.createEvent
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   put:
 *     summary: Update an existing event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.put(
  "/:id",
  authenticateUser,
  validate(updateEventSchema),
  eventController.updateEvent
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
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
 *         description: Event deleted successfully
 */
router.delete("/:id", authenticateUser, eventController.deleteEvent);

module.exports = router;
