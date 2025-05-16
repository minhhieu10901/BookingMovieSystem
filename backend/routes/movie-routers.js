import express from 'express';
import {
    addMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    getLatestMovies,
    get3MoviesMostBooked,
    getMovieShowtimes
} from '../controllers/movie-controller.js';
import { verifyToken } from '../middleware/auth.js';

const movieRouter = express.Router();

// Public routes - order matters in Express!
movieRouter.get("/most-booked", get3MoviesMostBooked);
movieRouter.get("/latest", getLatestMovies); // Use the exact path you're calling in Postman
movieRouter.get("/", getAllMovies); // Get all movies with optional filters
movieRouter.get("/:id", getMovieById); // Get movie by ID - should be AFTER specific routes
movieRouter.get("/:id/showtimes", getMovieShowtimes); // Get showtimes for a specific movie

// Protected routes - Admin only
movieRouter.post("/", verifyToken, addMovie); // Add new movie
movieRouter.put("/:id", verifyToken, updateMovie); // Update movie
movieRouter.delete("/:id", verifyToken, deleteMovie); // Delete movie

export default movieRouter; 