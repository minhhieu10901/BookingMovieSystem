import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    actors: [{
        type: String,
        required: true
    }],
    director: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,  // Duration in minutes
        required: true,
    },
    genre: [{
        type: String,
        required: true
    }],
    releaseDate: {
        type: Date,
        required: true,
    },
    posterUrl: {
        type: String,
        required: true,
    },
    trailerUrl: {
        type: String,
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['coming_soon', 'now_showing', 'ended'],
        default: 'coming_soon'
    },
    bookingCount: {
        type: Number,
        default: 0
    },
    showtimes: [{
        type: mongoose.Types.ObjectId,
        ref: "Showtime"
    }],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
        required: true,
    }
});

export default mongoose.model("Movie", movieSchema);