import Application from "../models/application.model.js";
import Collaboration from "../models/collaboration.model.js";

// Apply collaboration
export const applyCollaboration = async (req, res, next) => {
  try {
    const { collaborationId, message } = req.body;

    if (!collaborationId || !message) {
      res.status(400);
      throw new Error("Collaboration ID and message are required");
    }

    // validations
    const collaboration = await Collaboration.findById(collaborationId);
    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (collaboration.status === "closed") {
      res.status(400);
      throw new Error("This collaboration is no longer accepting applications");
    }

    if (new Date(collaboration.deadline) < new Date()) {
      res.status(400);
      throw new Error("This collaboration deadline has passed");
    }

    // Check if influencer already applied
    const existingApplication = await Application.findOne({
      collaborationId,
      influencerId: req.user.id,
    });
    if (existingApplication) {
      res.status(409);
      throw new Error("You have already applied for this collaboration");
    }

    const application = await Application.create({
      collaborationId,
      influencerId: req.user.id,
      message,
    });

    await application.populate([
      { path: "collaborationId", select: "title platform category" },
      { path: "influencerId", select: "name email profileImage" },
    ]);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Get my applications (Access influencer only)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      influencerId: req.user.id,
    })
      .populate("collaborationId", "title platform category imageUrl")
      .select("collaborationId status appliedAt")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// Get applicants (brand only)
export const getCollaborationApplicants = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(
      req.params.collaborationId,
    );

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (collaboration.createdBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error(
        "Not authorized to view applicants for this collaboration",
      );
    }

    const applications = await Application.find({
      collaborationId: req.params.collaborationId,
    })
      .populate("influencerId", "name profileImage")
      .select("influencerId status appliedAt")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// update application (Brand only)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, brandFeedback } = req.body;

    if (!status) {
      res.status(400);
      throw new Error("Status is required");
    }

    if (!["accepted", "rejected"].includes(status)) {
      res.status(400);
      throw new Error('Status must be either "accepted" or "rejected"');
    }

    const application = await Application.findById(req.params.id).populate(
      "collaborationId",
    );

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    if (
      application.collaborationId.createdBy.toString() !==
      req.user.id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to update this application");
    }

    // Prevent re-reviewing an already reviewed application
    if (application.status !== "pending") {
      res.status(400);
      throw new Error(`Application has already been ${application.status}`);
    }

    application.status = status;
    if (brandFeedback) application.brandFeedback = brandFeedback.trim();
    await application.save();

    await application.populate("influencerId", "name email profileImage");

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Get application by id
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate(
        "influencerId",
        "name email profileImage bio followersCount portfolio socialLinks",
      )
      .populate(
        "collaborationId",
        "title platform category budget deadline status createdBy",
      );

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const isInfluencer =
      application.influencerId._id.toString() === req.user.id.toString();
    const isBrand =
      application.collaborationId.createdBy.toString() ===
      req.user.id.toString();

    if (!isInfluencer && !isBrand) {
      res.status(403);
      throw new Error("Not authorized to view this application");
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
};
