import ProviderProfile from "../models/ProviderProfile.js";
import ServiceCategory from "../models/ServiceCategory.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

const getProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id,
    }).populate("categories", "name icon");
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, categories, city, area, hourlyRate, experience } = req.body;
    const updateData = { bio, city, area, experience };
    if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
    if (categories)
      updateData.categories = Array.isArray(categories)
        ? categories
        : JSON.parse(categories);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      const existing = await ProviderProfile.findOne({ user: req.user._id });
      updateData.portfolio = [...(existing.portfolio || []), ...newImages];
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, runValidators: true },
    ).populate("categories", "name icon");
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    profile.isAvailable = !profile.isAvailable;
    await profile.save();
    res.json({ success: true, isAvailable: profile.isAvailable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { provider: req.user._id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate("customer", "name email phone")
      .populate("category", "name icon")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changeBookingStatus = async (req, res, newStatus, extra = {}) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    booking.status = newStatus;
    booking.statusHistory.push({
      status: newStatus,
      changedBy: req.user._id,
      reason: req.body.reason || "",
    });
    if (newStatus === "completed") {
      booking.completedAt = new Date();
      await ProviderProfile.findOneAndUpdate(
        { user: req.user._id },
        { $inc: { totalJobsCompleted: 1 } },
      );
    }
    Object.assign(booking, extra);
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const acceptBooking = (req, res) => changeBookingStatus(req, res, "confirmed");
const rejectBooking = (req, res) =>
  changeBookingStatus(req, res, "cancelled", { cancelledBy: "provider" });
const startJob = (req, res) => changeBookingStatus(req, res, "in-progress");
const completeJob = (req, res) => changeBookingStatus(req, res, "completed");

// POST /api/provider/bookings/:id/notes
const addWorkNote = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    booking.workNotes.push({ note: req.body.note });
    await booking.save();
    res.json({ success: true, workNotes: booking.workNotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/provider/bookings/:id/images
const uploadJobImages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    const { type } = req.body; // 'before' or 'after'
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    if (type === "before") booking.beforeImages.push(...urls);
    else booking.afterImages.push(...urls);
    await booking.save();
    res.json({
      success: true,
      beforeImages: booking.beforeImages,
      afterImages: booking.afterImages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/provider/reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      provider: req.user._id,
      isModerated: false,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getProfile,
  updateProfile,
  toggleAvailability,
  getBookings,
  acceptBooking,
  rejectBooking,
  startJob,
  completeJob,
  addWorkNote,
  uploadJobImages,
  getMyReviews,
};
