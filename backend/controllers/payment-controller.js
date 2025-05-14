import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import mongoose from "mongoose";

export const createPayment = async (req, res, next) => {
    const { booking, paymentMethod, transactionId } = req.body;

    try {
        // Validate booking exists
        const existingBooking = await Booking.findById(booking);
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if payment already exists for this booking
        const existingPayment = await Payment.findOne({ booking });
        if (existingPayment) {
            return res.status(400).json({
                message: "Payment already exists for this booking"
            });
        }

        // Create new payment
        const payment = new Payment({
            booking,
            user: existingBooking.user,
            showtime: existingBooking.showtime,
            seats: existingBooking.seats,
            tickets: existingBooking.tickets,
            totalAmount: existingBooking.totalAmount,
            paymentMethod,
            transactionId,
            status: 'pending'
        });

        await payment.save();

        // Update booking status
        existingBooking.status = 'confirmed';
        await existingBooking.save();

        // Update showtime available seats
        await Showtime.findByIdAndUpdate(
            existingBooking.showtime,
            { $inc: { availableSeats: -existingBooking.seats.length } }
        );

        return res.status(201).json({
            message: "Payment created successfully",
            payment
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error creating payment",
            error: err.message
        });
    }
};

export const getPaymentById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findById(id)
            .populate('booking')
            .populate('user')
            .populate('showtime')
            .populate('seats')
            .populate('tickets.ticket');

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        return res.status(200).json({ payment });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching payment",
            error: err.message
        });
    }
};

export const getPaymentsByUser = async (req, res, next) => {
    const { userId } = req.params;
    const { status, startDate, endDate } = req.query;

    try {
        let query = { user: userId };
        if (status) query.status = status;
        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate) query.paymentDate.$gte = new Date(startDate);
            if (endDate) query.paymentDate.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('booking')
            .populate('showtime')
            .sort({ paymentDate: -1 });

        return res.status(200).json({ payments });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching payments",
            error: err.message
        });
    }
};

export const updatePaymentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status, refundReason } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Payment not found" });
        }

        // Validate status transition
        if (payment.status === 'completed' && status === 'refunded') {
            // Handle refund
            payment.status = 'refunded';
            payment.refundDate = new Date();
            payment.refundReason = refundReason;

            // Update booking status
            await Booking.findByIdAndUpdate(
                payment.booking,
                { status: 'cancelled' },
                { session }
            );

            // Update showtime available seats
            await Showtime.findByIdAndUpdate(
                payment.showtime,
                { $inc: { availableSeats: payment.seats.length } },
                { session }
            );
        } else if (payment.status === 'pending' && status === 'completed') {
            payment.status = 'completed';
            payment.paymentDate = new Date();
        } else {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid status transition"
            });
        }

        await payment.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            message: "Payment status updated successfully",
            payment
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error updating payment status",
            error: err.message
        });
    }
};

export const getPaymentStats = async (req, res, next) => {
    const { startDate, endDate } = req.query;

    try {
        let matchStage = {};
        if (startDate || endDate) {
            matchStage.paymentDate = {};
            if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
            if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
        }

        const stats = await Payment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        return res.status(200).json({ stats });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching payment statistics",
            error: err.message
        });
    }
}; 