import express from 'express';
import {
    addRoom,
    getRoomById,
    getRoomsByCinema,
    updateRoom,
    deleteRoom
} from '../controllers/room-controller.js';
import { verifyToken } from '../middleware/auth.js';

const roomRouter = express.Router();

// Public routes
roomRouter.get("/cinema/:cinemaId", getRoomsByCinema); // Get rooms by cinema
roomRouter.get("/:id", getRoomById); // Get room by ID

// Protected routes - Admin only
roomRouter.post("/", verifyToken, addRoom); // Add new room
roomRouter.put("/:id", verifyToken, updateRoom); // Update room
roomRouter.delete("/:id", verifyToken, deleteRoom); // Delete room

export default roomRouter; 