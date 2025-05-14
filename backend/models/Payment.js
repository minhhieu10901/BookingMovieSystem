import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Types.ObjectId,
        ref: "Booking",
    },
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
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'cash', 'momo', 'zalopay', 'bank_transfer'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    transactionId: {
        type: String,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    refundDate: {
        type: Date,
    },
    refundReason: {
        type: String,
    }
});

export default mongoose.model("Payment", paymentSchema); 