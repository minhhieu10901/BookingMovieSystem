import express from 'express';
import { newBooking, getBookingById, deleteBooking, getAllBookings } from '../controllers/booking-controller.js';

const bookingsRouter = express.Router();

bookingsRouter.post("/", newBooking); // add booking
bookingsRouter.get("/:id", getBookingById); // get booking by id
bookingsRouter.get("/", getAllBookings); // get all bookings
bookingsRouter.delete("/:id", deleteBooking ); // delete
export default bookingsRouter;
