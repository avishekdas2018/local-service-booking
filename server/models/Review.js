import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    isModerated: { type: Boolean, default: false },
    moderationNote: { type: String, default: "" },
  },
  { timestamps: true },
);

// Update provider's avg rating after save
reviewSchema.post("save", async function () {
  const ProviderProfile = mongoose.model("ProviderProfile");
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { provider: this.provider, isModerated: false } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);
  if (stats.length > 0) {
    await ProviderProfile.findOneAndUpdate(
      { user: this.provider },
      {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count,
      },
    );
  }
});

export default mongoose.model("Review", reviewSchema);
