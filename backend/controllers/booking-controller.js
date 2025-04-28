import Booking from "../models/Bookings.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const newBooking = async (req, res, next) => {
    const { movie, date, seatNumber, user } = req.body;

    let existingMovie;
    let existingUser;
    try {
        existingMovie = await Movie.findById(movie);
        existingUser = await User.findById(user);
    } catch (error) {
        return console.log(error);
    }
    if (!existingMovie) {
        return res.status(404).json({ message: "Movie not found with given ID" });
    }
    if (!existingUser) {
        return res.status(404).json({ message: "User not found with given ID" });
    }

    let booking;
    try {
        booking = new Booking({
            movie,
            date: new Date(`${date}`),
            seatNumber,
            user,
        });
        const session = await mongoose.startSession();
        session.startTransaction();
        await booking.save({ session });
        existingMovie.bookings.push(booking);
        existingUser.bookings.push(booking);
        await existingMovie.save({ session });
        await existingUser.save({ session });
        await booking.save({ session });
        await session.commitTransaction();
        //booking = await booking.save();
    } catch (error) {
        return console.log(error);
    }
    if (!booking) {
        return res.status(500).json({ message: "Unable to create a booking" });
    }
    return res.status(201).json({ booking });
}
export const getBookingById = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        booking = await Booking.findById(id)//.populate("movie").populate("user"); 
    } catch (err) {
        return console.log(err);
    }
    if (!booking) {
        return res.status(500).json({ message: "Invalid Booking ID" });
    }
    return res.status(200).json({ booking });
}
export const deleteBooking = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        booking = await Booking.findByIdAndDelete(id).populate("user movie");
        const session = await mongoose.startSession();
        session.startTransaction();
        await booking.movie.bookings.pull(booking);
        await booking.user.bookings.pull(booking);
        await booking.movie.save({ session });
        await booking.user.save({ session });
        await session.commitTransaction();
    } catch (err) {
        return console.log(err);
    }
    if (!booking) {
        return res.status(500).json({ message: "Unable to delete booking" });
    }
    return res.status(200).json({ message: "Booking deleted successfully" });
}
export const getAllBookings = async (req, res, next) => {
    let bookings;
    try {
        bookings = await Booking.find().populate("user movie");

    } catch (err) {
        return console.log(err);
    }
    if (!bookings) {
        return res.status(500).json({ message: "Request failed" });
    }
    return res.status(200).json({ bookings });
}