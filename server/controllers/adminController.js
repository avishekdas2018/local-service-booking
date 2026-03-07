import Booking from "../models/Booking.js";
import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import ServiceCategory from "../models/ServiceCategory.js";
import Review from "../models/Review.js";

const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      totalCategories,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      ProviderProfile.countDocuments({ isApproved: true }),
      ProviderProfile.countDocuments({ isApproved: false }),
      ServiceCategory.countDocuments({ isActive: true }),
      Review.countDocuments(),
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        pendingProviders,
        totalCategories,
        totalReviews,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/providers/pending
const getPendingProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find({ isApproved: false })
      .populate("user", "name email createdAt")
      .populate("categories", "name");
    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/providers (all)
const getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderProfile.find()
      .populate("user", "name email createdAt")
      .populate("categories", "name");
    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/providers/:id/approve
const approveProvider = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    profile.isApproved = true;
    profile.approvedAt = new Date();
    profile.rejectionReason = "";
    await profile.save();
    res.json({ success: true, message: "Provider approved", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/providers/:id/reject
const rejectProvider = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    profile.isApproved = false;
    profile.rejectionReason = req.body.reason || "Does not meet requirements";
    await profile.save();
    res.json({ success: true, message: "Provider rejected", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Categories ---
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const category = await ServiceCategory.create({ name, description, icon });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Reviews ---
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .populate("booking", "status scheduledDate")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const moderateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    review.isModerated = !review.isModerated;
    review.moderationNote = req.body.note || "";
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- User Management ---

// GET /api/admin/users?role=customer|provider|admin
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;
    const users = await User.find(query).sort({ createdAt: -1 });
    // Attach provider profiles where applicable
    const providerIds = users
      .filter((u) => u.role === "provider")
      .map((u) => u._id);
    const profiles = await ProviderProfile.find({
      user: { $in: providerIds },
    }).populate("categories", "name");
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });
    const result = users.map((u) => {
      const obj = u.toJSON();
      if (u.role === "provider")
        obj.providerProfile = profileMap[u._id.toString()] || null;
      return obj;
    });
    res.json({ success: true, users: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const obj = user.toJSON();
    if (user.role === "provider") {
      obj.providerProfile = await ProviderProfile.findOne({
        user: user._id,
      }).populate("categories", "name");
    }
    // Count bookings
    obj.bookingCount = await Booking.countDocuments(
      user.role === "provider"
        ? { provider: user._id }
        : { customer: user._id },
    );
    res.json({ success: true, user: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, isActive },
      { new: true, runValidators: true },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.role === "admin")
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete admin users" });
    // Clean up related data
    if (user.role === "provider") {
      await ProviderProfile.deleteOne({ user: user._id });
    }
    await Booking.deleteMany(
      user.role === "provider"
        ? { provider: user._id }
        : { customer: user._id },
    );
    await Review.deleteMany(
      user.role === "provider"
        ? { provider: user._id }
        : { customer: user._id },
    );
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User and related data deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/ban
const banProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "provider")
      return res
        .status(400)
        .json({ success: false, message: "Not a provider" });
    const profile = await ProviderProfile.findOne({ user: user._id });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    profile.isBanned = true;
    profile.isAvailable = false;
    profile.banReason = req.body.reason || "Violation of platform policies";
    await profile.save();
    user.isActive = false;
    await user.save();
    res.json({ success: true, message: "Provider banned", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/unban
const unbanProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "provider")
      return res
        .status(400)
        .json({ success: false, message: "Not a provider" });
    const profile = await ProviderProfile.findOne({ user: user._id });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Provider profile not found" });
    profile.isBanned = false;
    profile.banReason = "";
    await profile.save();
    user.isActive = true;
    await user.save();
    res.json({ success: true, message: "Provider unbanned", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getStats,
  getPendingProviders,
  getAllProviders,
  approveProvider,
  rejectProvider,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReviews,
  moderateReview,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banProvider,
  unbanProvider,
};
