import express from 'express';
import {
    addShowtime,
    getShowtimeById,
    getShowtimesByCinema,
    getShowtimesByRoom,
    updateShowtime,
    deleteShowtime
} from '../controllers/showtime-controller.js';
import { verifyToken } from '../middleware/auth.js';

const showtimeRouter = express.Router();

// Public routes
showtimeRouter.get("/cinema/:cinemaId", getShowtimesByCinema);
showtimeRouter.get("/room/:roomId", getShowtimesByRoom);
showtimeRouter.get("/:id", getShowtimeById);

// Protected routes - Admin only
showtimeRouter.post("/", verifyToken, addShowtime);
showtimeRouter.put("/:id", verifyToken, updateShowtime);
showtimeRouter.delete("/:id", verifyToken, deleteShowtime);

export default showtimeRouter; 