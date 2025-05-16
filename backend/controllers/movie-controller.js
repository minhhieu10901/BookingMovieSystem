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
        if (!title || !description || !posterUrl || !director || !duration  || !genre || !releaseDate) {
            return res.status(422).json({
                success: false,
                message: "Missing required fields",
                required: ["title", "description", "posterUrl", "director", "duration", "genre", "releaseDate"]
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
export const get3MoviesMostBooked = async (req, res, next) => {
    try {
        const movies = await Movie.find({
            status: 'now_showing'
        })
            .sort({ bookingCount: -1 })
            .limit(3)
            .select('title description posterUrl releaseDate status rating bookingCount');

        if (!movies || movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No movies found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully retrieved most booked movies",
            count: movies.length,
            movies: movies
        });
    } catch (err) {
        console.error("Error fetching most booked movies:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching movies",
            error: err.message
        });
    }
}
export const getLatestMovies = async (req, res, next) => {
    try {
        const latestMovies = await Movie.find({
            status: { $in: ['now_showing', 'coming_soon'] } // Only get active movies
        })
            .sort({ releaseDate: -1 }) // Sort by newest release date
            .limit(3) // Limit to 3 movies
            .select('title description posterUrl releaseDate status rating'); // Select only necessary fields

        if (!latestMovies || latestMovies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No movies found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully retrieved latest movies",
            count: latestMovies.length,
            movies: latestMovies
        });
    } catch (err) {
        console.error("Error fetching latest movies:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching latest movies",
            error: err.message
        });
    }
};

export const getAllMovies = async (req, res, next) => {
    try {
        const { status, genre, featured } = req.query;
        let query = {};

        // Add filters if provided
        if (status) query.status = status;
        if (genre) query.genre = { $in: [genre] };
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Yêu cầu xác thực. Vui lòng đăng nhập lại."
        });
    }

    const extractedToken = authHeader.split(" ")[1];
    let adminId;
    try {
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
        adminId = decoded.id;
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Tìm phim cần xóa
        const movie = await Movie.findById(id).session(session);
        if (!movie) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phim"
            });
        }

        // Kiểm tra quyền xóa phim
        if (movie.admin.toString() !== adminId) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa phim này"
            });
        }

        // Xóa các lịch chiếu liên quan
        const deletedShowtimes = await Showtime.deleteMany({ movie: id }).session(session);
        console.log(`Đã xóa ${deletedShowtimes.deletedCount} lịch chiếu liên quan`);

        // Xóa phim khỏi danh sách phim đã thêm của admin
        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { $pull: { addedMovies: id } },
            { session, new: true }
        );

        if (!admin) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy admin"
            });
        }

        // Xóa phim
        await movie.deleteOne({ session });

        // Hoàn tất transaction
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Phim và các dữ liệu liên quan đã được xóa thành công"
        });
    } catch (err) {
        await session.abortTransaction();
        console.error("Error deleting movie:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xóa phim",
            error: err.message
        });
    } finally {
        session.endSession();
    }
};

export const getMovieShowtimes = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Validate movieId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid movie ID format" });
        }

        // Find showtimes for the movie
        const showtimes = await Showtime.find({ movie: id })
            .populate("cinema", "name location")
            .populate("room", "name screenType capacity")
            .sort({ date: 1, startTime: 1 });

        if (!showtimes || showtimes.length === 0) {
            return res.status(200).json({ message: "No showtimes found for this movie", showtimes: [] });
        }

        // Transform data for frontend
        const transformedShowtimes = showtimes.map(showtime => ({
            id: showtime._id,
            date: showtime.date,
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            cinema: showtime.cinema.name,
            location: showtime.cinema.location,
            room: showtime.room.name,
            screenType: showtime.room.screenType,
            status: showtime.status,
            bookedSeats: showtime.bookedSeats.length
        }));

        return res.status(200).json({ showtimes: transformedShowtimes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};