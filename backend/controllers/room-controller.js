import Room from "../models/Room.js";
import Cinema from "../models/Cinema.js";
import Showtime from "../models/Showtime.js";
import mongoose from "mongoose";

export const getAllRooms = async (req, res, next) => {
    const { type, status, cinema } = req.query;

    try {
        // Build query based on filters
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (cinema) query.cinema = cinema;

        const rooms = await Room.find(query)
            .populate('cinema')
            .sort({ name: 1 });

        return res.status(200).json({ rooms });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching rooms",
            error: err.message
        });
    }
};

export const addRoom = async (req, res, next) => {
    const { name, cinema, type, features, capacity } = req.body;

    try {
        // Validate cinema exists
        const existingCinema = await Cinema.findById(cinema);
        if (!existingCinema) {
            return res.status(404).json({ message: "Cinema not found" });
        }

        // Check if room name already exists in this cinema
        const existingRoom = await Room.findOne({
            cinema,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingRoom) {
            return res.status(400).json({
                message: "Room with this name already exists in this cinema"
            });
        }

        // Create new room
        const room = new Room({
            name,
            cinema,
            type,
            features,
            capacity,
            status: 'active'
        });

        await room.save();

        // Update cinema's rooms
        existingCinema.rooms.push(room._id);
        await existingCinema.save();

        return res.status(201).json({
            message: "Room created successfully",
            room
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error creating room",
            error: err.message
        });
    }
};

export const getRoomById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const room = await Room.findById(id)
            .populate('cinema')
            .populate({
                path: 'showtimes',
                populate: {
                    path: 'movie'
                }
            });

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.status(200).json({ room });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching room",
            error: err.message
        });
    }
};

export const getRoomsByCinema = async (req, res, next) => {
    const { cinemaId } = req.params;
    const { type, status } = req.query;

    try {
        let query = { cinema: cinemaId };
        if (type) query.type = type;
        if (status) query.status = status;

        const rooms = await Room.find(query)
            .populate('cinema')
            .sort({ name: 1 });

        return res.status(200).json({ rooms });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching rooms",
            error: err.message
        });
    }
};

export const updateRoom = async (req, res, next) => {
    const { id } = req.params;
    const { name, type, features, capacity, status } = req.body;

    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // If updating name, check for duplicates
        if (name && name !== room.name) {
            const existingRoom = await Room.findOne({
                cinema: room.cinema,
                name: { $regex: new RegExp(`^${name}$`, 'i') }
            });

            if (existingRoom) {
                return res.status(400).json({
                    message: "Room with this name already exists in this cinema"
                });
            }
            room.name = name;
        }

        // Update other fields if provided
        if (type) room.type = type;
        if (features) room.features = features;
        if (capacity) room.capacity = capacity;
        if (status) room.status = status;

        await room.save();

        return res.status(200).json({
            message: "Room updated successfully",
            room
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating room",
            error: err.message
        });
    }
};

export const deleteRoom = async (req, res, next) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const room = await Room.findById(id);
        if (!room) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if room has any upcoming showtimes
        const upcomingShowtime = await Showtime.findOne({
            room: id,
            date: { $gte: new Date() },
            status: { $in: ['scheduled', 'active'] }
        });

        if (upcomingShowtime) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Cannot delete room with upcoming showtimes"
            });
        }

        // Remove room from cinema
        await Cinema.findByIdAndUpdate(
            room.cinema,
            { $pull: { rooms: id } },
            { session }
        );

        // Delete all showtimes for this room
        await Showtime.deleteMany({ room: id }, { session });

        // Delete the room
        await room.deleteOne({ session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Room and related showtimes deleted successfully"
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error deleting room",
            error: err.message
        });
    }
}; 