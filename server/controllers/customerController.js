import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import ServiceCategory from "../models/ServiceCategory.js";
import ProviderProfile from "../models/ProviderProfile.js";

const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProviders = async (req, res) => {
  try {
    const { category, city, area, minRate, maxRate } = req.query;
    const query = { isApproved: true, isAvailable: true };
    if (city) query.city = { $regex: city, $options: "i" };
    if (area) query.area = { $regex: area, $options: "i" };
    if (category) query.categories = category;
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    const providers = await ProviderProfile.find(query)
      .populate("user", "name email avatar")
      .populate("categories", "name icon")
      .sort({ avgRating: -1 });
    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProviderById = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id)
      .populate("user", "name email avatar phone")
      .populate("categories", "name icon");
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });
    const reviews = await Review.find({
      provider: profile.user._id,
      isModerated: false,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, profile, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      providerProfileId,
      categoryId,
      address,
      city,
      area,
      scheduledDate,
      notes,
      estimatedHours,
    } = req.body;
    const providerProfile = await ProviderProfile.findById(providerProfileId);
    if (!providerProfile || !providerProfile.isApproved) {
      return res
        .status(400)
        .json({ success: false, message: "Provider not available" });
    }
    const hours = Number(estimatedHours) || 1;
    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      providerProfile: providerProfileId,
      category: categoryId,
      address,
      city,
      area: area || "",
      scheduledDate: new Date(scheduledDate),
      notes: notes || "",
      customerImage: req.file ? `/uploads/${req.file.filename}` : "",
      pricingSnapshot: {
        hourlyRate: providerProfile.hourlyRate,
        estimatedHours: hours,
        estimatedTotal: providerProfile.hourlyRate * hours,
      },
      statusHistory: [{ status: "requested", changedBy: req.user._id }],
    });
    const populated = await Booking.findById(booking._id)
      .populate("provider", "name email")
      .populate("category", "name icon");
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate("provider", "name email")
      .populate("category", "name icon")
      .populate("providerProfile", "hourlyRate avgRating city area")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("provider", "name email phone")
      .populate("category", "name icon")
      .populate("providerProfile", "hourlyRate avgRating bio city area");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (!["requested", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule at current status",
      });
    }
    booking.rescheduleHistory.push({
      oldDate: booking.scheduledDate,
      newDate: new Date(req.body.newDate),
    });
    booking.scheduledDate = new Date(req.body.newDate);
    booking.statusHistory.push({
      status: booking.status,
      changedBy: req.user._id,
      reason: "Rescheduled by customer",
    });
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (!["requested", "confirmed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel at current status" });
    }
    booking.status = "cancelled";
    booking.cancelledBy = "customer";
    booking.cancellationReason = req.body.reason || "";
    booking.statusHistory.push({
      status: "cancelled",
      changedBy: req.user._id,
      reason: req.body.reason || "Cancelled by customer",
    });
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed bookings",
      });
    }
    if (booking.hasReview) {
      return res
        .status(400)
        .json({ success: false, message: "Review already submitted" });
    }
    const providerProfile = await ProviderProfile.findOne({
      user: booking.provider,
    });
    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      providerProfile: providerProfile?._id,
      rating: req.body.rating,
      comment: req.body.comment || "",
    });
    booking.hasReview = true;
    await booking.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getCategories,
  rescheduleBooking,
  cancelBooking,
  submitReview,
  getMyBookings,
  getBookingById,
  createBooking,
  getProviders,
  getProviderById,
};
