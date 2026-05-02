import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    platform: {
      type: String,
      required: [true, "Platform is required"],
      enum: ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Other"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Fashion",
        "Food",
        "Tech",
        "Fitness",
        "Beauty",
        "Travel",
        "Gaming",
        "Other",
      ],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },

    requirements: {
      type: String,
      required: [true, "Requirements are required"],
      trim: true,
    },

    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },

    imageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Collaboration = mongoose.model("Collaboration", collaborationSchema);
export default Collaboration;
