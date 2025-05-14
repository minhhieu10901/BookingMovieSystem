import Bookings from "../models/Booking.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";


export const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        return console.log(err);
    }
    if (!users) {
        return res.status(500).json({ message: "Unexpected Error  Occured" });
    }
    return res.status(200).json({ users });
};

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || name.trim() === "" || !email || email.trim() === "" || !password || password.trim() === "") {
            return res.status(422).json({
                success: false,
                message: "Invalid Input",
                details: "Name, email and password are required"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
                details: "Please use a different email address"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(422).json({
                success: false,
                message: "Invalid password",
                details: "Password must be at least 6 characters long"
            });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save user
        const savedUser = await user.save();

        if (!savedUser) {
            return res.status(500).json({
                success: false,
                message: "Unable to add user",
                details: "Database error occurred"
            });
        }

        // Return success response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                bookings: savedUser.bookings
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error registering user",
            details: err.message
        });
    }
};
export const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, email, password } = req.body;
    if (!name && name.trim() === "" && !email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Input" });
    }
    let user;
    try {
        user = await User.findByIdAndUpdate(id, { name, email, password });
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Unable to update user" });
    }
    return res.status(200).json({ message: "User updated successfully" });
};

export const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findByIdAndDelete(id);
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Unable to delete user" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
};

export const login = async (req, res, next) => {
    try {
        // Check if request body exists
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing"
            });
        }

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify password
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bookings: user.bookings
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

export const getBookingsOfUser = async (req, res, next) => {
    const id = req.params.id;
    let bookings;
    try {
        bookings = await Bookings.find({ user: id }).populate({
            path: "user",
            select: "name email"
        }).populate("movie");
    } catch (err) {
        return console.log(err);
    }
    if (!bookings) {
        return res.status(500).json({ message: "Unable to find bookings" });
    }
    return res.status(200).json({ bookings });
}

export const getUserById = async (req, res, next) => {
    const id = req.params.id;
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        return console.log(err);
    }
    if (!user) {
        return res.status(500).json({ message: "Unexpected Error  Occured" });
    }
    return res.status(200).json({ user });
};