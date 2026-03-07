import express from "express";
import upload from "../middleware/upload.js";
import {
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
} from "../controllers/providerController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

const guard = [protect, authorize("customer")];

router.get("/profile", ...guard, getProfile);
router.put("/profile", ...guard, upload.array("portfolio", 5), updateProfile);
router.patch("/availability", ...guard, toggleAvailability);

router.get("/bookings", ...guard, getBookings);
router.patch("/bookings/:id/accept", ...guard, acceptBooking);
router.patch("/bookings/:id/reject", ...guard, rejectBooking);
router.patch("/bookings/:id/start", ...guard, startJob);
router.patch("/bookings/:id/complete", ...guard, completeJob);
router.post("/bookings/:id/notes", ...guard, addWorkNote);
router.post(
  "/bookings/:id/images",
  ...guard,
  upload.array("images", 5),
  uploadJobImages,
);

router.get("/reviews", ...guard, getMyReviews);

export default router;
