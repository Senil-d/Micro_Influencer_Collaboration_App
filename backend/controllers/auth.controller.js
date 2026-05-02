import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// generate token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// validate user input
const validateRegisterInput = ({ name, email, password, role }) => {
  const errors = [];

  if (!name || name.trim() === "") errors.push("Name is required");
  if (!email || email.trim() === "") errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!role) errors.push("Role is required");

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (email && !emailRegex.test(email)) errors.push("Invalid email format");

  if (password && password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (role && !["brand", "influencer"].includes(role))
    errors.push('Role must be either "brand" or "influencer"');

  return errors;
};

// Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const errors = validateRegisterInput({ name, email, password, role });
    if (errors.length > 0) {
      res.status(400);
      throw new Error(errors.join(", "));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("Email is already registered");
    }

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// user login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // input validation
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// get an user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// update an user
export const updateUser = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (profileImage) updates.profileImage = profileImage;

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error("No valid fields provided to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current password and new password are required");
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }
    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error("New password must be different from current password");
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    // Assign new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
