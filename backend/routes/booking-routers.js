import express from 'express';
import { addBooking, getAllBookings, getBookingById } from '../controllers/booking-controller.js';

const bookingRouter = express.Router();

bookingRouter.post("/", addBooking); // add booking
