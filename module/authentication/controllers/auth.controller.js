const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const { generateToken } = require("../../../utils/token");
const { sendSuccess, sendError } = require("../../../utils/apiResponse");

// Register a new user
exports.register = asyncErrorHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return sendError(res, "An account with this email already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || "attendee",
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  const userData = newUser.toJSON();
  delete userData.password;

  return sendSuccess(
    res,
    "User registered successfully",
    {
      user: userData,
      token,
    },
    201
  );
});

// User login
exports.login = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return sendError(res, "Invalid email or password", 401);
  }

  if (user.status !== "active") {
    return sendError(res, "This account is inactive or suspended", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, "Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const userData = user.toJSON();
  delete userData.password;

  return sendSuccess(res, "Login successful", {
    user: userData,
    token,
  });
});

// Get current profile
exports.getProfile = asyncErrorHandler(async (req, res) => {
  return sendSuccess(res, "Profile fetched successfully", req.user);
});

// Update profile
exports.updateProfile = asyncErrorHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  const userData = user.toJSON();
  delete userData.password;

  return sendSuccess(res, "Profile updated successfully", userData);
});

// Change password
exports.changePassword = asyncErrorHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return sendError(res, "Incorrect current password", 400);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return sendSuccess(res, "Password updated successfully");
});
