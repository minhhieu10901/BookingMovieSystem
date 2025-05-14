import express from 'express';
import {
    createPayment,
    getPaymentById,
    getPaymentsByUser,
    updatePaymentStatus,
    getPaymentStats
} from '../controllers/payment-controller.js';
import { verifyToken } from '../middleware/auth.js';

const paymentRouter = express.Router();

// Public routes
paymentRouter.post("/", createPayment);

// Protected routes (authenticated)
paymentRouter.get("/user/:userId", verifyToken, getPaymentsByUser);

// Admin only routes
paymentRouter.get("/stats", verifyToken, getPaymentStats);
paymentRouter.get("/:id", verifyToken, getPaymentById);
paymentRouter.put("/:id/status", verifyToken, updatePaymentStatus);

export default paymentRouter;   