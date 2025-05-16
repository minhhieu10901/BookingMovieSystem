import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import User from "../models/User.js";
import Seat from "../models/Seat.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

export const newBooking = async (req, res, next) => {
    const { showtime, seats, tickets, paymentMethod } = req.body;
    const userId = req.body.user || req.user.id;

    let existingShowtime, existingUser, existingSeats, existingTickets;
    try {
        existingShowtime = await Showtime.findById(showtime);
        existingUser = await User.findById(userId);
        existingSeats = await Seat.find({ _id: { $in: seats } });
        existingTickets = await Ticket.find({ _id: { $in: tickets.map(t => t.ticket) } });
    } catch (error) {
        return res.status(500).json({ message: "Error finding resources", error: error.message });
    }

    if (!existingShowtime) {
        return res.status(404).json({ message: "Showtime not found" });
    }
    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
    }
    if (existingSeats.length !== seats.length) {
        return res.status(404).json({ message: "Some seats not found" });
    }
    if (existingTickets.length !== tickets.length) {
        return res.status(404).json({ message: "Some tickets not found" });
    }

    // Kiểm tra ghế có sẵn không
    const unavailableSeats = existingSeats.filter(seat =>
        seat.status !== 'available' ||
        existingShowtime.bookedSeats.includes(seat._id)
    );
    if (unavailableSeats.length > 0) {
        return res.status(400).json({
            message: "Some seats are not available",
            seats: unavailableSeats.map(seat => seat.seatNumber)
        });
    }

    // Tính tổng tiền
    const totalAmount = tickets.reduce((total, ticket) => {
        const ticketInfo = existingTickets.find(t => t._id.toString() === ticket.ticket);
        return total + (ticketInfo.price * ticket.quantity);
    }, 0);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Tạo payment
        const payment = new Payment({
            user: userId,
            showtime,
            seats,
            tickets,
            totalAmount,
            paymentMethod,
            status: 'pending'
        });
        await payment.save({ session });

        // Tạo booking
        const booking = new Booking({
            user: userId,
            showtime,
            seats,
            tickets,
            payment: payment._id,
            totalAmount,
            status: 'pending'
        });
        await booking.save({ session });

        // Cập nhật trạng thái ghế
        for (const seatId of seats) {
            await Seat.findByIdAndUpdate(
                seatId,
                { $set: { status: 'booked' } },
                { session }
            );
        }

        // Cập nhật showtime
        existingShowtime.bookedSeats.push(...seats);
        await existingShowtime.save({ session });

        // Cập nhật user
        existingUser.bookings.push(booking._id);
        await existingUser.save({ session });

        await session.commitTransaction();

        // Verify seat status after transaction
        const updatedSeats = await Seat.find({ _id: { $in: seats } });
        const allSeatsBooked = updatedSeats.every(seat => seat.status === 'booked');

        return res.status(201).json({
            message: "Booking created successfully",
            booking,
            payment,
            seatsUpdated: allSeatsBooked
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error creating booking",
            error: error.message
        });
    }
};

export const getBookingById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const booking = await Booking.findById(id)
            .populate('user', 'name email phone')
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie' },
                    {
                        path: 'room',
                        populate: { path: 'cinema' }
                    }
                ]
            })
            .populate('seats')
            .populate({
                path: 'tickets.ticket',
                model: 'Ticket'
            })
            .populate('payment');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ booking });
    } catch (err) {
        return res.status(500).json({ message: "Error finding booking", error: err.message });
    }
};

export const getUserBookings = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie' },
                    {
                        path: 'room',
                        populate: { path: 'cinema' }
                    }
                ]
            })
            .populate('seats')
            .populate({
                path: 'tickets.ticket',
                model: 'Ticket'
            })
            .populate('payment')
            .sort({ bookingDate: -1 });

        return res.status(200).json({ bookings });
    } catch (err) {
        return res.status(500).json({ message: "Error finding bookings", error: err.message });
    }
};

export const cancelBooking = async (req, res, next) => {
    const id = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findById(id)
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie' },
                    {
                        path: 'room',
                        populate: { path: 'cinema' }
                    }
                ]
            })
            .populate('seats')
            .populate({
                path: 'tickets.ticket',
                model: 'Ticket'
            })
            .populate('payment');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        // Cập nhật trạng thái booking
        await Booking.findByIdAndUpdate(
            id,
            { $set: { status: 'cancelled' } },
            { session, runValidators: false }
        );

        // Cập nhật trạng thái payment
        booking.payment.status = 'refunded';
        booking.payment.refundDate = new Date();
        booking.payment.refundReason = req.body.reason || 'Cancelled by user';
        await booking.payment.save({ session });

        // Cập nhật trạng thái ghế
        await Seat.updateMany(
            { _id: { $in: booking.seats } },
            { $set: { status: 'available' } },
            { session }
        );

        // Cập nhật showtime - xóa seats khỏi bookedSeats
        const showtime = booking.showtime;
        showtime.bookedSeats = showtime.bookedSeats.filter(
            seatId => !booking.seats.map(seat => seat._id.toString()).includes(seatId.toString())
        );
        await showtime.save({ session });

        await session.commitTransaction();

        // Lấy lại booking với seats đã cập nhật
        const updatedBooking = await Booking.findById(id)
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie' },
                    {
                        path: 'room',
                        populate: { path: 'cinema' }
                    }
                ]
            })
            .populate('seats')
            .populate({
                path: 'tickets.ticket',
                model: 'Ticket'
            })
            .populate('payment');

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking: updatedBooking
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            message: "Error cancelling booking",
            error: error.message
        });
    }
};

export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
            .populate({
                path: 'showtime',
                populate: [
                    { path: 'movie' },
                    {
                        path: 'room',
                        populate: { path: 'cinema' }
                    }
                ]
            })
            .populate('seats')
            .populate({
                path: 'tickets.ticket',
                model: 'Ticket'
            })
            .populate('payment')
            .sort({ bookingDate: -1 });

        return res.status(200).json({ bookings });
    } catch (err) {
        return res.status(500).json({ message: "Error finding bookings", error: err.message });
    }
};