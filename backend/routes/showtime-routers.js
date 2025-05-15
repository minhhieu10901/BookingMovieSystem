import express from 'express';
import {
    addShowtime,
    getShowtimeById,
    getShowtimesByMovie,
    getShowtimesByRoom,
    updateShowtime,
    deleteShowtime
} from '../controllers/showtime-controller.js';
import { verifyToken } from '../middleware/auth.js';

const showtimeRouter = express.Router();

// Public routes
showtimeRouter.get("/movie/:movieId", getShowtimesByMovie); // Get showtimes by movie
showtimeRouter.get("/room/:roomId", getShowtimesByRoom); // Get showtimes by room
showtimeRouter.get("/:id", getShowtimeById); // Get showtime by ID

// Protected routes - Admin only
showtimeRouter.post("/", verifyToken, addShowtime); // Add new showtime
showtimeRouter.put("/:id", verifyToken, updateShowtime); // Update showtime
showtimeRouter.delete("/:id", verifyToken, deleteShowtime); // Delete showtime

export default showtimeRouter; 