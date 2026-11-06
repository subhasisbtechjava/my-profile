const express = require("express");
const router = express.Router();

const authRoutes = require("../module/authentication/routes/auth.routes");
const eventRoutes = require("../module/event/routes/event.routes");
const attendeeRoutes = require("../module/attendee/routes/attendee.routes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "EventPlanner API",
  });
});

// Mount module routes
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/attendees", attendeeRoutes);

module.exports = router;
