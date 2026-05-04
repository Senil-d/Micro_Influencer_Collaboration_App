import Collaboration from "../models/collaboration.model.js";
import Application from "../models/application.model.js";

// Create collaboration
export const createCollaboration = async (req, res, next) => {
  try {
    const {
      title,
      description,
      platform,
      category,
      budget,
      requirements,
      deadline,
      imageUrls,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !platform ||
      platform.length === 0 ||
      !category ||
      !budget ||
      !requirements ||
      !deadline
    ) {
      res.status(400);
      throw new Error("All fields are required");
    }

    // Validate deadline is in the future
    if (new Date(deadline) <= new Date()) {
      res.status(400);
      throw new Error("Deadline must be a future date");
    }

    const collaboration = await Collaboration.create({
      title,
      description,
      platform,
      category,
      budget,
      requirements,
      deadline,
      imageUrls: imageUrls || [],
      createdBy: req.user.id,
    });

    await collaboration.populate("createdBy", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Collaboration created successfully",
      collaboration,
    });
  } catch (err) {
    next(err);
  }
};

// Get all collaorations
export const getAllCollaborations = async (req, res, next) => {
  try {
    const { platform, category } = req.query;

    const filter = { status: "open" };

    // For array platform field use $in operator
    if (platform) filter.platform = { $in: [platform] };
    if (category) filter.category = category;

    const collaborations = await Collaboration.find(filter)
      .populate("createdBy", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (err) {
    next(err);
  }
};

// Get brand collaborations
export const getBrandCollaborations = async (req, res, next) => {
  try {
    const collaborations = await Collaboration.find({ createdBy: req.user.id })
      .populate("createdBy", "name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (err) {
    next(err);
  }
};

// Get collaboration by Id
export const getCollaborationById = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id).populate(
      "createdBy",
      "name email profileImage",
    );

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    res.status(200).json({
      success: true,
      collaboration,
    });
  } catch (err) {
    next(err);
  }
};

// Update collaboration
export const updateCollaboration = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (collaboration.createdBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this collaboration");
    }

    const {
      title,
      description,
      platform,
      category,
      budget,
      requirements,
      deadline,
      imageUrls,
      status,
    } = req.body;

    if (deadline && new Date(deadline) <= new Date()) {
      res.status(400);
      throw new Error("Deadline must be a future date");
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (platform && platform.length > 0) updates.platform = platform;
    if (category) updates.category = category;
    if (budget) updates.budget = budget;
    if (requirements) updates.requirements = requirements.trim();
    if (deadline) updates.deadline = deadline;
    if (imageUrls && imageUrls.length > 0) updates.imageUrls = imageUrls;
    if (status) updates.status = status;

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error("No valid fields provided to update");
    }

    const updated = await Collaboration.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("createdBy", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Collaboration updated successfully",
      collaboration: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Delete collaboration
export const deleteCollaboration = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (collaboration.createdBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this collaboration");
    }

    await Application.deleteMany({ collaborationId: req.params.id });
    await collaboration.deleteOne();

    res.status(200).json({
      success: true,
      message: "Collaboration deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
