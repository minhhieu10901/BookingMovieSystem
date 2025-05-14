import mongoose from "mongoose";

// Drop the existing model if it exists
mongoose.models = {};

const showtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true,
    },
    room: {
        type: mongoose.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    cinema: {
        type: mongoose.Types.ObjectId,
        ref: "Cinema",
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled',
    },
    bookedSeats: [{
        type: mongoose.Types.ObjectId,
        ref: "Seat"
    }]
});

export default mongoose.model("Showtime", showtimeSchema); 