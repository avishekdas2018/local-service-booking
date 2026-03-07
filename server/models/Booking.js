import mongoose from "mongoose";

const workNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema(
  {
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, default: "" },
    scheduledDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    customerImage: { type: String, default: "" }, // uploaded by customer
    pricingSnapshot: {
      hourlyRate: { type: Number, default: 0 },
      estimatedHours: { type: Number, default: 1 },
      estimatedTotal: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["requested", "confirmed", "in-progress", "completed", "cancelled"],
      default: "requested",
    },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "" },
      },
    ],
    workNotes: [workNoteSchema],
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],
    rescheduleHistory: [
      {
        oldDate: { type: Date },
        newDate: { type: Date },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    cancelledBy: {
      type: String,
      enum: ["customer", "provider", "admin", ""],
      default: "",
    },
    cancellationReason: { type: String, default: "" },
    completedAt: { type: Date },
    hasReview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
