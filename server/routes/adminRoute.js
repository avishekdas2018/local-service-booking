import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
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
} from "../controllers/adminController.js";

const router = express.Router();

const guard = [protect, authorize("admin")];

router.get("/stats", ...guard, getStats);
router.get("/providers", ...guard, getAllProviders);
router.get("/providers/pending", ...guard, getPendingProviders);
router.patch("/providers/:id/approve", ...guard, approveProvider);
router.patch("/providers/:id/reject", ...guard, rejectProvider);

router.get("/categories", ...guard, getCategories);
router.post("/categories", ...guard, createCategory);
router.put("/categories/:id", ...guard, updateCategory);
router.delete("/categories/:id", ...guard, deleteCategory);

router.get("/reviews", ...guard, getAllReviews);
router.patch("/reviews/:id/moderate", ...guard, moderateReview);

// User management
router.get("/users", ...guard, getAllUsers);
router.get("/users/:id", ...guard, getUserById);
router.put("/users/:id", ...guard, updateUser);
router.delete("/users/:id", ...guard, deleteUser);
router.patch("/users/:id/ban", ...guard, banProvider);
router.patch("/users/:id/unban", ...guard, unbanProvider);

export default router;
