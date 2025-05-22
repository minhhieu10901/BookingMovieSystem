import express from 'express';
import {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    getPaymentStats,
    completeUserPayment
} from '../controllers/payment-controller.js';
import { verifyToken } from '../middleware/auth.js';

const paymentRouter = express.Router();

// Admin routes
paymentRouter.get("/admin", verifyToken, getAllPayments);
paymentRouter.get("/admin/stats", verifyToken, getPaymentStats);
paymentRouter.get("/admin/:id", verifyToken, getPaymentById);
paymentRouter.patch("/admin/:id/status", verifyToken, updatePaymentStatus);

// User route - không yêu cầu xác thực token
paymentRouter.patch("/complete/:id", completeUserPayment);

// Add a more permissive route that doesn't require token verification for testing
// This should be removed in production
if (process.env.NODE_ENV === 'development') {
    paymentRouter.post("/test/complete/:id", completeUserPayment);
}

export default paymentRouter;