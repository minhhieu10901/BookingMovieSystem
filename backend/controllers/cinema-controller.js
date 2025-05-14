import Cinema from "../models/Cinema.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

// Add new cinema
export const addCinema = async (req, res, next) => {
    try {
        const {
            name,
            address,
            city,
            phone,
            email,
            openingHours,
            status = 'active'
        } = req.body;

        // Validate required fields
        if (!name || !address || !city || !phone || !email) {
            return res.status(422).json({
                message: "Missing required fields",
                required: ["name", "address", "city", "phone", "email"]
            });
        }

        const cinema = new Cinema({
            name,
            address,
            city,
            phone,
            email,
            openingHours,
            status,
            admin: req.admin._id
        });

        const session = await mongoose.startSession();
        session.startTransaction();

        await cinema.save({ session });
        await session.commitTransaction();

        return res.status(201).json({
            message: "Cinema added successfully",
            cinema
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error adding cinema",
            error: err.message
        });
    }
};

// Get all cinemas
export const getAllCinemas = async (req, res, next) => {
    try {
        const { status, city } = req.query;
        let query = {};

        if (status) query.status = status;
        if (city) query.city = city;

        const cinemas = await Cinema.find(query)
            .populate('admin', 'email')
            .populate('rooms');

        return res.status(200).json({ cinemas });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching cinemas",
            error: err.message
        });
    }
};

// Get cinema by ID
export const getCinemaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cinema = await Cinema.findById(id)
            .populate('admin', 'email')
            .populate({
                path: 'rooms',
                populate: {
                    path: 'seats'
                }
            });

        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found" });
        }

        return res.status(200).json({ cinema });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching cinema",
            error: err.message
        });
    }
};

// Update cinema
export const updateCinema = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            address,
            city,
            phone,
            email,
            openingHours,
            status
        } = req.body;

        const cinema = await Cinema.findById(id);
        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found" });
        }

        // Check if admin is authorized
        if (cinema.admin.toString() !== req.admin._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this cinema" });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (address) updateFields.address = address;
        if (city) updateFields.city = city;
        if (phone) updateFields.phone = phone;
        if (email) updateFields.email = email;
        if (openingHours) updateFields.openingHours = openingHours;
        if (status) updateFields.status = status;

        const updatedCinema = await Cinema.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Cinema updated successfully",
            cinema: updatedCinema
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating cinema",
            error: err.message
        });
    }
};

// Delete cinema
export const deleteCinema = async (req, res, next) => {
    try {
        const { id } = req.params;

        const cinema = await Cinema.findById(id);
        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found" });
        }

        // Check if admin is authorized
        if (cinema.admin.toString() !== req.admin._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this cinema" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        // Delete all rooms and their seats
        const rooms = await Room.find({ cinema: id });
        for (const room of rooms) {
            await Room.findByIdAndDelete(room._id, { session });
        }

        // Delete cinema
        await Cinema.findByIdAndDelete(id, { session });

        await session.commitTransaction();

        return res.status(200).json({
            message: "Cinema and associated rooms deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error deleting cinema",
            error: err.message
        });
    }
};
