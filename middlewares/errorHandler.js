const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error Caught:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.ENVIRONMENT === "development" && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
