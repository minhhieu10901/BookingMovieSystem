import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    showtime: {
        type: mongoose.Types.ObjectId,
        ref: "Showtime",
        required: true,
    },
    seats: [{
        type: mongoose.Types.ObjectId,
        ref: "Seat",
        required: true,
    }],
    tickets: [{
        ticket: {
            type: mongoose.Types.ObjectId,
            ref: "Ticket",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        }
    }],
    payment: {
        type: mongoose.Types.ObjectId,
        ref: "Payment",
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    totalAmount: {
        type: Number,
        required: true,
    }
});

export default mongoose.model("Booking", bookingSchema);
