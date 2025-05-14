import Seat from "../models/Seat.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

export const addSeats = async (req, res, next) => {
    const { room, seats } = req.body;

    try {
        // Validate room exists
        const existingRoom = await Room.findById(room);
        if (!existingRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Validate seats data
        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: "Invalid seats data" });
        }

        // Check for duplicate seat numbers
        const seatNumbers = seats.map(seat => seat.seatNumber);
        const uniqueSeatNumbers = new Set(seatNumbers);
        if (uniqueSeatNumbers.size !== seatNumbers.length) {
            return res.status(400).json({ message: "Duplicate seat numbers found" });
        }

        // Check if seats already exist for this room
        const existingSeats = await Seat.find({ room });
        if (existingSeats.length > 0) {
            return res.status(400).json({
                message: "Seats already exist for this room. Use update instead."
            });
        }

        // Create seats
        const seatDocuments = seats.map(seat => ({
            room,
            seatNumber: seat.seatNumber,
            row: seat.row,
            column: seat.column,
            type: seat.type || 'standard',
            status: 'available'
        }));

        const createdSeats = await Seat.insertMany(seatDocuments);

        return res.status(201).json({
            message: "Seats created successfully",
            seats: createdSeats
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error creating seats",
            error: err.message
        });
    }
};

export const getSeatsByRoom = async (req, res, next) => {
    const { roomId } = req.params;
    const { status, type } = req.query;

    try {
        let query = { room: roomId };
        if (status) query.status = status;
        if (type) query.type = type;

        const seats = await Seat.find(query)
            .populate('room')
            .sort({ row: 1, column: 1 });

        return res.status(200).json({ seats });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching seats",
            error: err.message
        });
    }
};

export const updateSeat = async (req, res, next) => {
    const { id } = req.params;
    const { type, status } = req.body;

    try {
        const seat = await Seat.findById(id);
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        // Update fields if provided
        if (type) seat.type = type;
        if (status) seat.status = status;

        await seat.save();

        return res.status(200).json({
            message: "Seat updated successfully",
            seat
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating seat",
            error: err.message
        });
    }
};

export const updateMultipleSeats = async (req, res, next) => {
    const { roomId } = req.params;
    const { seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: "Invalid seats data" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updates = seats.map(seat => ({
            updateOne: {
                filter: { _id: seat._id, room: roomId },
                update: { $set: { type: seat.type, status: seat.status } }
            }
        }));

        const result = await Seat.bulkWrite(updates, { session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Seats updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error updating seats",
            error: err.message
        });
    }
};

export const deleteSeats = async (req, res, next) => {
    const { roomId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if any seats are booked
        const bookedSeats = await Seat.findOne({
            room: roomId,
            status: 'booked'
        });

        if (bookedSeats) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Cannot delete seats that are currently booked"
            });
        }

        // Delete all seats for this room
        await Seat.deleteMany({ room: roomId }, { session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Seats deleted successfully"
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error deleting seats",
            error: err.message
        });
    }
}; 