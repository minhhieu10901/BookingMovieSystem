import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "You are not authenticated!"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                message: "Admin not found!"
            });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token!"
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.admin) {
            return res.status(403).json({
                message: "You are not authorized!"
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            message: "Error checking admin status"
        });
    }
}; 