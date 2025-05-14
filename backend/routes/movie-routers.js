import express from 'express';
import { 
    addMovie, 
    getAllMovies, 
    getMovieById, 
    updateMovie, 
    deleteMovie 
} from '../controllers/movie-controller.js';
import { verifyToken } from '../middleware/auth.js';

const movieRouter = express.Router();

// Public routes
movieRouter.get("/", getAllMovies); // Get all movies with optional filters
movieRouter.get("/:id", getMovieById); // Get movie by ID

// Protected routes - Admin only
movieRouter.post("/", verifyToken, addMovie); // Add new movie
movieRouter.put("/:id", verifyToken, updateMovie); // Update movie
movieRouter.delete("/:id", verifyToken, deleteMovie); // Delete movie

export default movieRouter; 