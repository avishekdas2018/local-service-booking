import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: { type: String, default: "" },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
    ],
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    portfolio: [{ type: String }],
    isApproved: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    approvedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("ProviderProfile", providerProfileSchema);
