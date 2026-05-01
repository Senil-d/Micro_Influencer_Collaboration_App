import express from "express";
import {
  register,
  login,
  getUser,
  updateUser,
  changePassword,
} from "../controllers/user.controller.js";
import { protect } from "../middleware//user.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/User", protect, getUser);
router.put("/update", protect, updateUser);
router.put("/change-password", protect, changePassword);

export default router;
