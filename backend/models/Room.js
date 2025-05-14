import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cinema: {
        type: mongoose.Types.ObjectId,
        ref: "Cinema",
        required: true,
    },
    type: {
        type: String,
        enum: ['Standard', 'IMAX', '3D', '4DX', 'VIP'],
        default: 'Standard',
        required: true,
    },
    features: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active',
    },
    seats: [{
        type: mongoose.Types.ObjectId,
        ref: "Seat"
    }],
    showtimes: [{
        type: mongoose.Types.ObjectId,
        ref: "Showtime"
    }]
});

export default mongoose.model("Room", roomSchema); 