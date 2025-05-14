import express from 'express';
import {
    newBooking,
    getBookingById,
    getUserBookings,
    cancelBooking,
    getAllBookings
} from '../controllers/booking-controller.js';
import { verifyToken } from '../middleware/auth.js';

const bookingsRouter = express.Router();

// Public routes
bookingsRouter.post("/", newBooking);

// Protected routes - yêu cầu đăng nhập
bookingsRouter.get("/user/:userId", verifyToken, getUserBookings); // Lấy danh sách booking của user
bookingsRouter.post("/:id/cancel", verifyToken, cancelBooking); // Hủy booking
bookingsRouter.get("/", getAllBookings); // Lấy tất cả booking

// Admin routes
bookingsRouter.get("/:id", verifyToken, getBookingById); // Lấy chi tiết booking

export default bookingsRouter;
