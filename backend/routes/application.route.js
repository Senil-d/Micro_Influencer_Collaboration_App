import express from "express";
import {
  applyCollaboration,
  getMyApplications,
  getCollaborationApplicants,
  updateApplicationStatus,
  getApplicationById,
} from "../controllers/application.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Influencer Routes
router.post("/", protect, restrictTo("influencer"), applyCollaboration);
router.get("/my", protect, restrictTo("influencer"), getMyApplications);

// Brand Routes
router.get(
  "/collab/:collaborationId",
  protect,
  restrictTo("brand"),
  getCollaborationApplicants,
);
router.put("/:id", protect, restrictTo("brand"), updateApplicationStatus);

// common
router.get("/:id", protect, getApplicationById);

export default router;
