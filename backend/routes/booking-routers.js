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

// Endpoints không cần xác thực token
bookingsRouter.post("/", newBooking); // Tạo booking mới - gửi userId trong body

// Protected routes - yêu cầu đăng nhập bằng token
bookingsRouter.get("/user/:userId", verifyToken, getUserBookings); // Lấy danh sách booking của user
bookingsRouter.post("/:id/cancel", verifyToken, cancelBooking); // Hủy booking
bookingsRouter.get("/", getAllBookings); // Lấy tất cả booking

// Admin routes
bookingsRouter.get("/:id", verifyToken, getBookingById); // Lấy chi tiết booking

export default bookingsRouter;
