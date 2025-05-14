import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    room: {
        type: mongoose.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    seatNumber: {
        type: String,
        required: true,
    },
    row: {
        type: String,
        required: true,
    },
    column: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['standard', 'vip', 'couple', 'disabled'],
        default: 'standard',
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'booked', 'maintenance'],
        default: 'available',
    }
});

export default mongoose.model("Seat", seatSchema); 