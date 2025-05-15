import jwt from "jsonwebtoken";
import Movie from "../models/Movie.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Showtime from "../models/Showtime.js";

export const addMovie = async (req, res, next) => {
    try {
        // Check if request body exists
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }

        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is required"
            });
        }

        const extractedToken = authHeader.split(" ")[1];
        if (!extractedToken) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        let adminId;
        //verify token
        try {
            const decrypted = jwt.verify(extractedToken, process.env.JWT_SECRET);
            adminId = decrypted.id;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        const {
            title,
            description,
            actors,
            director,
            duration,
            language,
            genre,
            releaseDate,
            endDate,
            posterUrl,
            trailerUrl,
            rating,
            featured,
            status
        } = req.body;

        // Validate required fields
        if (!title || !description || !posterUrl || !director || !duration || !language || !genre || !releaseDate) {
            return res.status(422).json({
                success: false,
                message: "Missing required fields",
                required: ["title", "description", "posterUrl", "director", "duration", "language", "genre", "releaseDate"]
            });
        }

        // Validate rating
        if (rating && (rating < 0 || rating > 10)) {
            return res.status(422).json({
                success: false,
                message: "Rating must be between 0 and 10"
            });
        }

        // Validate status if provided
        if (status && !['coming_soon', 'now_showing', 'ended'].includes(status)) {
            return res.status(422).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const movie = new Movie({
            title,
            description,
            actors,
            director,
            duration,
            language,
            genre,
            releaseDate: new Date(releaseDate),
            endDate: endDate ? new Date(endDate) : undefined,
            posterUrl,
            trailerUrl,
            rating,
            featured: featured || false,
            status: status || 'coming_soon',
            admin: adminId
        });

        const session = await mongoose.startSession();
        session.startTransaction();

        const adminUser = await Admin.findById(adminId);
        if (!adminUser) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        await movie.save({ session });
        adminUser.addedMovies.push(movie);
        await adminUser.save({ session });
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie
        });
    } catch (err) {
        console.error("Error adding movie:", err);
        return res.status(500).json({
            success: false,
            message: "Error adding movie",
            error: err.message
        });
    }
};

export const getAllMovies = async (req, res, next) => {
    try {
        const { status, genre, language, featured } = req.query;
        let query = {};

        // Add filters if provided
        if (status) query.status = status;
        if (genre) query.genre = { $in: [genre] };
        if (language) query.language = language;
        if (featured) query.featured = featured === 'true';

        const movies = await Movie.find(query)
            .populate('admin', 'name email')
            .sort({ releaseDate: -1 });

        return res.status(200).json({ movies });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching movies",
            error: err.message
        });
    }
};

export const getMovieById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const movie = await Movie.findById(id)
            .populate('admin', 'name email')
            .populate({
                path: 'showtimes',
                populate: {
                    path: 'room',
                    populate: {
                        path: 'cinema'
                    }
                }
            });

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.status(200).json({ movie });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching movie",
            error: err.message
        });
    }
};

export const updateMovie = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if request body exists
        if (!req.body) {
            return res.status(400).json({ message: "Request body is required" });
        }

        const {
            title,
            description,
            actors,
            director,
            duration,
            genre,
            releaseDate,
            endDate,
            posterUrl,
            trailerUrl,
            rating,
            featured,
            status
        } = req.body;

        // Validate required fields
        if (!title || !description || !director || !duration || !genre || !releaseDate) {
            return res.status(422).json({
                message: "Missing required fields",
                required: ["title", "description", "director", "duration", "genre", "releaseDate"]
            });
        }

        // Validate rating if provided
        if (rating && (rating < 0 || rating > 10)) {
            return res.status(422).json({ message: "Rating must be between 0 and 10" });
        }

        // Validate status if provided
        if (status && !['coming_soon', 'now_showing', 'ended'].includes(status)) {
            return res.status(422).json({ message: "Invalid status value" });
        }

        const movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Check if admin is authorized
        if (movie.admin.toString() !== req.admin._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this movie" });
        }

        // Update fields
        const updateFields = {
            title,
            description,
            director,
            duration,
            genre,
            releaseDate: new Date(releaseDate),
            posterUrl,
            actors
        };

        // Optional fields
        if (endDate) updateFields.endDate = new Date(endDate);
        if (trailerUrl) updateFields.trailerUrl = trailerUrl;
        if (rating) updateFields.rating = rating;
        if (featured !== undefined) updateFields.featured = featured;
        if (status) updateFields.status = status;

        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Movie updated successfully",
            movie: updatedMovie
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating movie",
            error: err.message
        });
    }
};

export const deleteMovie = async (req, res, next) => {
    const { id } = req.params;

    // Verify token
    const extractedToken = req.headers.authorization.split(" ")[1];
    let adminId;
    try {
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
        adminId = decoded.id;
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const movie = await Movie.findById(id);
        if (!movie) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Movie not found" });
        }

        // Check if admin is authorized
        if (movie.admin.toString() !== adminId) {
            await session.abortTransaction();
            return res.status(403).json({ message: "Not authorized to delete this movie" });
        }

        // Delete related showtimes
        await Showtime.deleteMany({ movie: id }, { session });

        // Remove movie from admin's addedMovies
        await Admin.findByIdAndUpdate(
            adminId,
            { $pull: { addedMovies: id } },
            { session }
        );

        // Delete the movie
        await movie.deleteOne({ session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Movie and related showtimes deleted successfully"
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error deleting movie",
            error: err.message
        });
    }
};