import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import User from "../models/User.js";
import Seat from "../models/Seat.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import Movie from "../models/Movie.js";
import mongoose from "mongoose";

export const newBooking = async (req, res, next) => {
    const { showtime, seats, tickets, paymentMethod, totalAmount, userId } = req.body;

    // Lấy userId từ request body, không còn dùng req.user
    if (!userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để đặt vé" });
    }

    if (!showtime || !seats || !tickets || !paymentMethod) {
        return res.status(400).json({ message: "Missing required booking information" });
    }

    console.log("Received booking data:", {
        userId,
        showtime,
        seats: Array.isArray(seats) ? seats.length : 'not array',
        tickets: Array.isArray(tickets) ? tickets.length : 'not array',
        paymentMethod
    });

    let existingShowtime, existingUser, existingSeats, existingTickets;
    try {
        // Kiểm tra xem các entity có tồn tại không
        existingShowtime = await Showtime.findById(showtime);
        existingUser = await User.findById(userId);
        existingSeats = await Seat.find({ _id: { $in: seats } });
        existingTickets = await Ticket.find({ _id: { $in: tickets.map(t => t.ticket).filter(id => id) } });

        console.log(`Found user: ${existingUser?._id}, showtime: ${existingShowtime?._id}, seats: ${existingSeats.length}, tickets: ${existingTickets.length}`);
    } catch (error) {
        console.error("Error finding resources:", error);
        return res.status(500).json({ message: "Error finding resources", error: error.message });
    }

    if (!existingShowtime) {
        return res.status(404).json({ message: "Showtime not found" });
    }
    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
    }
    if (existingSeats.length !== seats.length) {
        return res.status(404).json({ message: `Some seats not found. Expected ${seats.length}, found ${existingSeats.length}` });
    }

    // Kiểm tra ghế có sẵn không
    const unavailableSeats = existingSeats.filter(seat =>
        seat.status !== 'available' ||
        existingShowtime.bookedSeats.some(
            bookedId => bookedId.toString() === seat._id.toString()
        )
    );

    if (unavailableSeats.length > 0) {
        return res.status(400).json({
            message: "Some seats are not available",
            seats: unavailableSeats.map(seat => seat.seatNumber)
        });
    }

    // Tính tổng tiền nếu không được cung cấp
    const calculatedTotalAmount = totalAmount || tickets.reduce((total, ticket) => {
        if (!ticket.ticket) return total;
        const ticketInfo = existingTickets.find(t => t._id.toString() === ticket.ticket);
        if (!ticketInfo) return total;
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
            totalAmount: calculatedTotalAmount,
            paymentMethod,
            status: 'pending'
        });
        await payment.save({ session });
        console.log("Payment created with ID:", payment._id);

        // Tạo booking và liên kết với payment
        const booking = new Booking({
            user: userId,
            showtime,
            seats,
            tickets,
            payment: payment._id,
            totalAmount: calculatedTotalAmount,
            status: 'pending'
        });
        await booking.save({ session });
        console.log("Booking created with ID:", booking._id);

        // Cập nhật liên kết payment với booking
        payment.booking = booking._id;
        await payment.save({ session });
        console.log("Updated payment with booking reference");

        // Cập nhật trạng thái ghế
        for (const seatId of seats) {
            await Seat.findByIdAndUpdate(
                seatId,
                { $set: { status: 'booked' } },
                { session }
            );
        }
        console.log("Updated seat status to 'booked'");

        // Cập nhật showtime
        existingShowtime.bookedSeats.push(...seats);
        await existingShowtime.save({ session });
        console.log("Updated showtime booked seats");

        // Cập nhật user
        existingUser.bookings.push(booking._id);
        await existingUser.save({ session });
        console.log("Updated user bookings");

        // Increment bookingCount for the movie
        await Movie.findByIdAndUpdate(
            existingShowtime.movie,
            { $inc: { bookingCount: 1 } },
            { session }
        );
        console.log("Incremented movie booking count");

        await session.commitTransaction();
        console.log("Transaction completed successfully");

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
        console.error("Error in booking transaction:", error);
        return res.status(500).json({
            message: "Error creating booking",
            error: error.message
        });
    } finally {
        session.endSession();
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