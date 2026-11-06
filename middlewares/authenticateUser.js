const createError = require("http-errors");
const { verifyToken } = require("../utils/token");
const User = require("../module/authentication/models/user.model");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Authorization token is missing or invalid"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return next(createError(401, "User not found or account is deactivated"));
    }

    if (user.status !== "active") {
      return next(createError(403, "User account is inactive"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(createError(401, "Invalid or expired token"));
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, "You do not have permission to perform this action"));
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
};
