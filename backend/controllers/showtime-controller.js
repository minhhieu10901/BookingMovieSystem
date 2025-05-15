import Showtime from "../models/Showtime.js";
import Movie from "../models/Movie.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

export const addShowtime = async (req, res) => {
    try {
        const { movie, room, date, startTime, endTime } = req.body;

        // Validate required fields
        if (!movie || !room || !date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Find movie and room
        const existingMovie = await Movie.findById(movie);
        const existingRoom = await Room.findById(room).populate('cinema');

        if (!existingMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        if (!existingRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Create showtime
        const showtime = new Showtime({
            movie,
            room,
            cinema: existingRoom.cinema._id,
            date: new Date(date),
            startTime,
            endTime,
            status: 'scheduled',
            bookedSeats: []
        });

        // Save showtime
        const savedShowtime = await showtime.save();

        // Update movie and room references
        await Promise.all([
            Movie.findByIdAndUpdate(movie, { $push: { showtimes: savedShowtime._id } }),
            Room.findByIdAndUpdate(room, { $push: { showtimes: savedShowtime._id } })
        ]);

        return res.status(201).json({
            success: true,
            message: "Showtime created successfully",
            data: savedShowtime
        });

    } catch (error) {
        console.error('Error in addShowtime:', error);
        return res.status(500).json({
            success: false,
            message: "Error creating showtime",
            error: error.message
        });
    }
};

export const getShowtimeById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const showtime = await Showtime.findById(id)
            .populate('movie')
            .populate({
                path: 'room',
                populate: {
                    path: 'cinema'
                }
            });

        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }

        return res.status(200).json({ showtime });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching showtime",
            error: err.message
        });
    }
};

export const getShowtimesByMovie = async (req, res, next) => {
    const { movieId } = req.params;
    const { date } = req.query;

    try {
        let query = { movie: movieId };
        if (date) {
            query.date = new Date(date);
        }

        const showtimes = await Showtime.find(query)
            .populate({
                path: 'room',
                populate: {
                    path: 'cinema'
                }
            })
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({ showtimes });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching showtimes",
            error: err.message
        });
    }
};

export const getShowtimesByRoom = async (req, res, next) => {
    const { roomId } = req.params;
    const { date } = req.query;

    try {
        let query = { room: roomId };
        if (date) {
            query.date = new Date(date);
        }

        const showtimes = await Showtime.find(query)
            .populate('movie')
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({ showtimes });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching showtimes",
            error: err.message
        });
    }
};

export const updateShowtime = async (req, res, next) => {
    const { id } = req.params;
    const { date, startTime, endTime, status } = req.body;

    try {
        const showtime = await Showtime.findById(id);
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }

        // Check if showtime can be updated
        if (showtime.status === 'completed' || showtime.status === 'cancelled') {
            return res.status(400).json({
                message: "Cannot update completed or cancelled showtime"
            });
        }

        // If updating time, check for conflicts
        if (date || startTime || endTime) {
            const newDate = date ? new Date(date) : showtime.date;
            const newStartTime = startTime || showtime.startTime;
            const newEndTime = endTime || showtime.endTime;

            const conflictingShowtime = await Showtime.findOne({
                _id: { $ne: id },
                room: showtime.room,
                date: newDate,
                $or: [
                    {
                        startTime: { $lt: newEndTime },
                        endTime: { $gt: newStartTime }
                    }
                ]
            });

            if (conflictingShowtime) {
                return res.status(400).json({
                    message: "Time slot conflicts with existing showtime",
                    conflictingShowtime
                });
            }

            showtime.date = newDate;
            showtime.startTime = newStartTime;
            showtime.endTime = newEndTime;
        }

        if (status) {
            showtime.status = status;
        }

        await showtime.save();

        return res.status(200).json({
            message: "Showtime updated successfully",
            showtime
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating showtime",
            error: err.message
        });
    }
};

export const deleteShowtime = async (req, res, next) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const showtime = await Showtime.findById(id);
        if (!showtime) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Showtime not found" });
        }

        // Check if showtime can be deleted
        if (showtime.status === 'completed' || showtime.status === 'cancelled') {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Cannot delete completed or cancelled showtime"
            });
        }

        // Remove showtime from movie
        await Movie.findByIdAndUpdate(
            showtime.movie,
            { $pull: { showtimes: id } },
            { session }
        );

        // Remove showtime from room
        await Room.findByIdAndUpdate(
            showtime.room,
            { $pull: { showtimes: id } },
            { session }
        );

        // Delete the showtime
        await showtime.deleteOne({ session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Showtime deleted successfully"
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error deleting showtime",
            error: err.message
        });
    }
}; 