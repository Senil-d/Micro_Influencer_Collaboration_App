import express from "express";
import {
  createCollaboration,
  getAllCollaborations,
  getBrandCollaborations,
  getCollaborationById,
  updateCollaboration,
  deleteCollaboration,
} from "../controllers/collaboration.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Brand Routes
router.post("/", protect, restrictTo("brand"), createCollaboration);
router.get("/myall", protect, restrictTo("brand"), getBrandCollaborations);
router.put("/:id", protect, restrictTo("brand"), updateCollaboration);
router.delete("/:id", protect, restrictTo("brand"), deleteCollaboration);

// All logged in user routes
router.get("/", protect, getAllCollaborations);
router.get("/:id", protect, getCollaborationById);

export default router;
