import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    try {
        // Support multiple token formats (Bearer token, direct token, cookie)
        const token =
            req.cookies?.accessToken ||
            req.headers?.authorization?.split(' ')[1] ||
            req.headers?.['x-access-token'] ||
            req.query?.token;

        if (!token) {
            console.log('Authentication failed: No token provided');
            return res.status(401).json({
                message: "Bạn cần đăng nhập để truy cập!",
                details: "No authentication token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified for user ID:', decoded.id);
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError.message);
            return res.status(401).json({
                message: "Token không hợp lệ hoặc đã hết hạn!",
                details: jwtError.message
            });
        }

        // Kiểm tra xem có phải token của admin hay không
        try {
            const admin = await Admin.findById(decoded.id);
            if (admin) {
                req.admin = admin;
                req.user = {
                    id: admin._id,
                    ...admin._doc,
                    isAdmin: true
                };
                return next();
            }
        } catch (adminError) {
            console.error('Error checking admin:', adminError.message);
            // Continue to user check, don't fail yet
        }

        // Kiểm tra xem có phải token của user không
        try {
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = {
                    id: user._id,
                    ...user._doc,
                    isAdmin: false
                };
                return next();
            }
        } catch (userError) {
            console.error('Error checking user:', userError.message);
            // Continue to final check
        }

        // Không tìm thấy người dùng nào
        console.error('Authentication failed: User not found for ID:', decoded.id);
        return res.status(401).json({
            message: "Không tìm thấy thông tin người dùng!",
            details: "User ID in token not found in database"
        });
    } catch (err) {
        console.error('General authentication error:', err.message);
        return res.status(401).json({
            message: "Lỗi xác thực người dùng!",
            details: err.message
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.admin) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập!"
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            message: "Lỗi khi kiểm tra quyền admin"
        });
    }
}; 