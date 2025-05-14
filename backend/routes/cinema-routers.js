import express from 'express';
import {
    addCinema,
    getCinemaById,
    getAllCinemas,
    updateCinema,
    deleteCinema,
} from '../controllers/cinema-controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const cinemaRouter = express.Router();

// Public routes
cinemaRouter.get("/", getAllCinemas);
cinemaRouter.get("/:id", getCinemaById);

// Protected routes (admin only)
cinemaRouter.post("/", verifyToken, isAdmin, addCinema);
cinemaRouter.put("/:id", verifyToken, isAdmin, updateCinema);
cinemaRouter.delete("/:id", verifyToken, isAdmin, deleteCinema);
// Remove this line since getCinemaStats is not implemented yet

export default cinemaRouter; 