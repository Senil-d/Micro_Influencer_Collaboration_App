import express from "express";
import {
  register,
  login,
  getUser,
  updateUser,
  changePassword,
  getUserProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getUser);
router.get("/users/:id", protect, getUserProfile);
router.put("/update", protect, updateUser);
router.put("/change-password", protect, changePassword);

export default router;
