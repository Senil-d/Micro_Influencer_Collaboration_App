import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collaboration",
      required: true,
    },

    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: [true, "Application message is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    brandFeedback: {
      type: String,
      default: "",
      trim: true,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index(
  { collaborationId: 1, influencerId: 1 },
  { unique: true },
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
