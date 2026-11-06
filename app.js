const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const config = require("./config/index");
const { connectDB } = require("./config/db.config");
const swaggerDocs = require("./swagger/swagger");
const accessLogGenerator = require("./middlewares/accessLogGenerator");
const apiRouter = require("./indexroute/index");
const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");

const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Custom access logger
app.use(accessLogGenerator);

// Base URL helper
app.locals.baseUrl = config.baseUrl;

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to EventPlanner API",
    version: "1.0.0",
    docs: "/api-docs",
    api: "/api/v1",
  });
});

// Main API Routes
app.use("/api/v1", apiRouter);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Process event handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    const port = config.port || 5000;
    app.listen(port, () => {
      console.log(`===============================================`);
      console.log(`🚀 EventPlanner API Server running on port ${port}`);
      console.log(`📖 Swagger API Docs: http://localhost:${port}/api-docs`);
      console.log(`🔌 Base API URL:     http://localhost:${port}/api/v1`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
