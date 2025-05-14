import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['standard', 'vip', 'couple', 'student'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
});

export default mongoose.model("Ticket", ticketSchema); 