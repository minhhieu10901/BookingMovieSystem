import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import adminRouter from './routes/admin-routes.js';
import userRouter from './routes/user-routes.js';
import movieRouter from './routes/movie-routers.js';
import cinemaRouter from './routes/cinema-routers.js';
import roomRouter from './routes/room-routers.js';
import seatRouter from './routes/seat-routers.js';
import showtimeRouter from './routes/showtime-routers.js';
import ticketRouter from './routes/ticket-routers.js';
import bookingRouter from './routes/booking-routers.js';
import paymentRouter from './routes/payment-routers.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/movies', movieRouter);
app.use('/api/cinemas', cinemaRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/seats', seatRouter);
app.use('/api/showtimes', showtimeRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);

// Error handling middleware
app.use((err, _, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Something went wrong!';
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});