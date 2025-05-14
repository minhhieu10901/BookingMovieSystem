import Ticket from "../models/Ticket.js";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";

export const addTicket = async (req, res, next) => {
    const { name, type, price, discount } = req.body;

    try {
        // Validate required fields
        if (!name || !type || !price) {
            return res.status(422).json({
                message: "Missing required fields",
                required: ["name", "type", "price"]
            });
        }

        // Check if ticket type already exists
        const existingTicket = await Ticket.findOne({
            type: { $regex: new RegExp(`^${type}$`, 'i') }
        });

        if (existingTicket) {
            return res.status(400).json({
                message: "Ticket type already exists"
            });
        }

        // Create new ticket
        const ticket = new Ticket({
            name,
            type,
            price,
            discount: discount || 0,
            status: 'active'
        });

        await ticket.save();

        return res.status(201).json({
            message: "Ticket created successfully",
            ticket
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error creating ticket",
            error: err.message
        });
    }
};

export const getAllTickets = async (req, res, next) => {
    const { type, status } = req.query;

    try {
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const tickets = await Ticket.find(query)
            .sort({ type: 1 });

        return res.status(200).json({ tickets });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching tickets",
            error: err.message
        });
    }
};

export const getTicketById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json({ ticket });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching ticket",
            error: err.message
        });
    }
};

export const updateTicket = async (req, res, next) => {
    const { id } = req.params;
    const { name, type, price, discount, status } = req.body;

    try {
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // If updating type, check for duplicates
        if (type && type !== ticket.type) {
            const existingTicket = await Ticket.findOne({
                _id: { $ne: id },
                type: { $regex: new RegExp(`^${type}$`, 'i') }
            });

            if (existingTicket) {
                return res.status(400).json({
                    message: "Ticket type already exists"
                });
            }
            ticket.type = type;
        }

        // Update other fields if provided
        if (name) ticket.name = name;
        if (price) ticket.price = price;
        if (discount !== undefined) ticket.discount = discount;
        if (status) ticket.status = status;

        await ticket.save();

        return res.status(200).json({
            message: "Ticket updated successfully",
            ticket
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error updating ticket",
            error: err.message
        });
    }
};

export const deleteTicket = async (req, res, next) => {
    const { id } = req.params;

    try {
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if ticket is in use
        const isInUse = await Booking.exists({
            'tickets.ticket': id
        });

        if (isInUse) {
            return res.status(400).json({
                message: "Cannot delete ticket that is in use"
            });
        }

        await ticket.deleteOne();

        return res.status(200).json({
            message: "Ticket deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error deleting ticket",
            error: err.message
        });
    }
}; 