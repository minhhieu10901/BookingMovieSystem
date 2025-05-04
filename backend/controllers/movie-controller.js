import jwt from "jsonwebtoken";
import Movie from "../models/Movie.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Bookings from "../models/Bookings.js";

export const addMovie = async (req, res, next) => {
    const extractedToken = req.headers.authorization.split(" ")[1]; // Bearer token
    if (!extractedToken && extractedToken.trim() === "") {
        return res.status(404).json({ message: "Token not found" });
    }
    let adminId;

    //verify token
    jwt.verify(extractedToken, process.env.SECRET_KEY, (err, decrypted) => {
        if (err) {
            return res.status(400).json({ message: `${err.message}` });
        } else {
            adminId = decrypted.id;
            return;
        }
    });
    // Create new movie
    const { title, description, actors, releaseDate, posterUrl, featured } = req.body;
    if (
        !title && title.trim() === "" &&
        !description && description.trim() === "" &&
        !posterUrl && posterUrl.trim() === ""
    ) {
        return res.status(422).json({ message: "Invalid Inputs" });
    }
    let movie;
    try {
        movie = new Movie({
            title,
            description,
            actors,
            releaseDate: new Date(`${releaseDate}`),
            posterUrl,
            featured,
            admin: adminId
        });
        const session = await mongoose.startSession();
        const adminUser = await Admin.findById(adminId);
        session.startTransaction();
        await movie.save({ session });
        adminUser.addedMovies.push(movie);
        await adminUser.save({ session });
        await session.commitTransaction();
        //movie = await movie.save();
    } catch (err) {
        return console.log(err);
    }
    if (!movie) {
        return res.status(500).json({ message: "Request add movie failed" });
    }
    return res.status(201).json({ movie });
}
export const getAllMovies = async (req, res, next) => {
    let movies;
    try {
        movies = await Movie.find();
    } catch (err) {
        return console.log(err);
    }
    if (!movies) {
        return res.status(500).json({ message: "Request failed" });
    }
    return res.status(200).json({ movies });
}
export const getMovieById = async (req, res, next) => {
    const id = req.params.id;
    let movie;
    try {
        movie = await Movie.findById(id);
    } catch (err) {
        return console.log(err);
    }
    if (!movie) {
        return res.status(500).json({ message: "Invalid Movie ID" });
    }
    return res.status(200).json({ movie });
}
export const deleteMovie = async (req, res, next) => {
    const id = req.params.id;

    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid movie ID format" });
    }

    let movie;
    try {
        // Tìm movie theo ID và populate dữ liệu liên quan
        movie = await Movie.findById(id).populate("bookings").populate("admin");
        if (!movie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        // Bắt đầu transaction để đảm bảo dữ liệu liên kết được xóa đúng
        const session = await mongoose.startSession();
        session.startTransaction();

        // Xóa tất cả các bookings liên quan
        await Bookings.deleteMany({ movie: id }, { session });

        // Cập nhật admin, loại bỏ movie khỏi danh sách addedMovies
        await Admin.findByIdAndUpdate(
            movie.admin._id,
            { $pull: { addedMovies: id } },
            { session }
        );

        // Xóa movie
        await movie.deleteOne({ session });

        // Commit transaction
        await session.commitTransaction();

        res.status(200).json({ message: "Movie deleted successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting movie" });
    }
};
export const updateMovie = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, actors, releaseDate, posterUrl, featured } = req.body;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid movie ID format" });
    }

    // Kiểm tra xem có token không
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token not found or invalid" });
    }

    const extractedToken = authHeader.split(" ")[1]; // Lấy token từ chuỗi "Bearer token"

    let adminId;
    jwt.verify(extractedToken, process.env.SECRET_KEY, (err, decrypted) => {
        if (err) {
            return res.status(403).json({ message: "Token verification failed" });
        }
        adminId = decrypted.id;
    });

    try {
        // Tìm movie trước khi cập nhật
        let movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        if (movie.admin.toString() !== adminId) {
            return res.status(403).json({ message: "Unauthorized action!" });
        }

        // Cập nhật thông tin movie
        movie.title = title || movie.title;
        movie.description = description || movie.description;
        movie.actors = actors || movie.actors;
        movie.releaseDate = releaseDate ? new Date(releaseDate) : movie.releaseDate;
        movie.posterUrl = posterUrl || movie.posterUrl;
        movie.featured = featured !== undefined ? featured : movie.featured;

        await movie.save();

        res.status(200).json({ message: "Movie updated successfully!", movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating movie" });
    }
};