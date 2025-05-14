import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    rooms: [{
        type: mongoose.Types.ObjectId,
        ref: "Room"
    }],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "Admin",
        required: true,
    }
});

export default mongoose.model("Cinema", cinemaSchema); 