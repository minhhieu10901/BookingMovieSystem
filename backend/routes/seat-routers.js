import express from 'express';
import {
    addSeats,
    getSeatsByRoom,
    updateSeat,
    updateMultipleSeats,
    deleteSeats
} from '../controllers/seat-controller.js';
import { verifyToken } from '../middleware/auth.js';

const seatRouter = express.Router();

// Public routes
seatRouter.get("/room/:roomId", getSeatsByRoom); // Get seats by room

// Protected routes - Admin only
seatRouter.post("/", verifyToken, addSeats); // Add seats to a room
seatRouter.put("/:id", verifyToken, updateSeat); // Update single seat
seatRouter.put("/room/:roomId/bulk", verifyToken, updateMultipleSeats); // Update multiple seats
seatRouter.delete("/room/:roomId", verifyToken, deleteSeats); // Delete all seats in a room

export default seatRouter; 