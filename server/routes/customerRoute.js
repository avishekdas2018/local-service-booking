import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getCategories,
  createBooking,
  getMyBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  submitReview,
} from "../controllers/customerController.js";

const router = express.Router();

const guard = [protect, authorize("customer")];

// router.get("/categories", getCategories);
// router.get("/providers", getProviders);
// router.get("/providers/:id", getProviderById);

router.post(
  "/bookings",
  ...guard,
  upload.single("customerImage"),
  createBooking,
);
router.post(
  "/bookings",
  ...guard,
  upload.single("customerImage"),
  createBooking,
);
router.get("/bookings", ...guard, getMyBookings);
router.get("/bookings/:id", ...guard, getBookingById);
router.patch("/bookings/:id/reschedule", ...guard, rescheduleBooking);
router.patch("/bookings/:id/cancel", ...guard, cancelBooking);
router.post("/bookings/:id/review", ...guard, submitReview);
