import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Showtime from '../models/Showtime.js';
import Seat from '../models/Seat.js';

// Lấy tất cả thanh toán cho admin
export const getAllPayments = async (req, res, next) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        // Sử dụng lean() để tối ưu hiệu suất và tránh lỗi với Documents quá lớn
        const payments = await Payment.find()
            .populate({
                path: 'user',
                select: 'name email phone'
            })
            .populate({
                path: 'booking',
                populate: {
                    path: 'seats'
                }
            })
            .populate({
                path: 'showtime',
                populate: [
                    {
                        path: 'movie',
                        select: 'title posterUrl'
                    },
                    {
                        path: 'room',
                        select: 'name',
                        populate: {
                            path: 'theater',
                            select: 'name location'
                        }
                    }
                ]
            })
            .sort({ paymentDate: -1 })
            .lean(); // Sử dụng lean() để trả về JSON thay vì Mongoose Documents

        return res.status(200).json({ payments });
    } catch (error) {
        console.error('Lỗi getAllPayments:', error);
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách thanh toán' });
    }
};

// Lấy chi tiết thanh toán theo ID
export const getPaymentById = async (req, res, next) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        const paymentId = req.params.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ message: 'ID thanh toán không hợp lệ' });
        }

        const payment = await Payment.findById(paymentId)
            .populate({
                path: 'user',
                select: 'name email phone profilePic'
            })
            .populate({
                path: 'booking',
                populate: {
                    path: 'seats'
                }
            })
            .populate({
                path: 'showtime',
                populate: [
                    {
                        path: 'movie',
                        select: 'title posterUrl duration'
                    },
                    {
                        path: 'room',
                        select: 'name',
                        populate: {
                            path: 'theater',
                            select: 'name location'
                        }
                    }
                ]
            })
            .lean(); // Sử dụng lean()

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }

        return res.status(200).json({ payment });
    } catch (error) {
        console.error('Lỗi getPaymentById:', error);
        return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết thanh toán' });
    }
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (req, res, next) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        const paymentId = req.params.id;
        const { status, refundReason } = req.body;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ message: 'ID thanh toán không hợp lệ' });
        }

        // Validate status
        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
        }

        // Lấy thanh toán hiện tại
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }

        // Cập nhật trạng thái
        const updateData = { status };

        // Nếu là refunded, thêm thông tin hoàn tiền
        if (status === 'refunded') {
            updateData.refundReason = refundReason || 'Hoàn tiền theo yêu cầu';
            updateData.refundDate = new Date();
        }

        // Cập nhật payment
        const updatedPayment = await Payment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true }
        );

        try {
            // Nếu chuyển sang refunded hoặc failed, cập nhật lại trạng thái ghế trong booking
            if ((status === 'refunded' || status === 'failed') && payment.booking) {
                // Tìm booking liên quan
                const booking = await Booking.findById(payment.booking).populate('seats showtime');

                if (booking && booking.showtime) {
                    // Cập nhật trạng thái booking
                    await Booking.findByIdAndUpdate(
                        payment.booking,
                        { status: status === 'refunded' ? 'refunded' : 'cancelled' },
                        { new: true }
                    );

                    // Giải phóng ghế đã đặt trong showtime
                    if (booking.seats && booking.seats.length > 0) {
                        const showtime = await Showtime.findById(booking.showtime);

                        if (showtime) {
                            const seatIds = booking.seats.map(seat =>
                                typeof seat === 'object' ? seat._id.toString() : seat.toString()
                            );

                            // Loại bỏ ghế đã đặt khỏi danh sách bookedSeats của showtime
                            showtime.bookedSeats = showtime.bookedSeats.filter(
                                seat => !seatIds.includes(typeof seat === 'object' ? seat._id.toString() : seat.toString())
                            );

                            await showtime.save();
                        }
                    }
                }
            }
        } catch (bookingError) {
            console.error('Lỗi xử lý booking:', bookingError);
            // Không fail request chính, chỉ log lỗi
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công',
            payment: updatedPayment
        });
    } catch (error) {
        console.error('Lỗi updatePaymentStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái thanh toán'
        });
    }
};

// Lấy thống kê thanh toán
export const getPaymentStats = async (req, res, next) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        // Thống kê theo trạng thái (bắt lỗi empty collections)
        let totalStatsByStatus = [];
        try {
            totalStatsByStatus = await Payment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]);
        } catch (aggregateError) {
            console.error('Lỗi aggregate stats:', aggregateError);
            totalStatsByStatus = [];
        }

        // Thống kê theo phương thức thanh toán
        let statsByPaymentMethod = [];
        try {
            statsByPaymentMethod = await Payment.aggregate([
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                }
            ]);
        } catch (methodError) {
            console.error('Lỗi aggregate payment method:', methodError);
            statsByPaymentMethod = [];
        }

        // Thống kê theo ngày trong 7 ngày gần đây
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        let dailyStats = [];
        try {
            dailyStats = await Payment.aggregate([
                {
                    $match: {
                        paymentDate: { $gte: lastWeek, $lte: today },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
        } catch (dailyError) {
            console.error('Lỗi aggregate daily stats:', dailyError);
            dailyStats = [];
        }

        return res.status(200).json({
            totalStats: totalStatsByStatus,
            paymentMethodStats: statsByPaymentMethod,
            dailyStats: dailyStats
        });
    } catch (error) {
        console.error('Lỗi getPaymentStats:', error);
        return res.status(500).json({ message: 'Lỗi server khi lấy thống kê thanh toán' });
    }
};

// Người dùng cập nhật trạng thái thanh toán
export const completeUserPayment = async (req, res, next) => {
    try {
        const paymentId = req.params.id;

        // Check if user is authenticated
        if (!req.user) {
            console.error('User not authenticated');
            return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thanh toán' });
        }

        const userId = req.user.id;

        console.log(`Processing payment completion: ID=${paymentId}, UserID=${userId}`);

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            console.error(`ID thanh toán không hợp lệ: ${paymentId}`);
            return res.status(400).json({ message: 'ID thanh toán không hợp lệ' });
        }

        console.log(`Đang cập nhật trạng thái thanh toán với ID: ${paymentId}`);

        // Sử dụng transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Lấy thanh toán hiện tại
            const payment = await Payment.findById(paymentId);

            if (!payment) {
                await session.abortTransaction();
                session.endSession();
                console.error(`Không tìm thấy thanh toán với ID: ${paymentId}`);
                return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
            }

            // Kiểm tra xem người dùng đã xác thực có phải là chủ sở hữu của payment này không
            // Đối với admin, bỏ qua kiểm tra này
            if (!req.user.isAdmin && payment.user && payment.user.toString() !== userId) {
                await session.abortTransaction();
                session.endSession();
                console.error(`Người dùng ${userId} không có quyền cập nhật thanh toán ${paymentId}`);
                return res.status(403).json({ message: 'Bạn không có quyền cập nhật thanh toán này' });
            }

            console.log(`Tìm thấy thanh toán: ${payment._id}, trạng thái hiện tại: ${payment.status}`);

            // Cập nhật trạng thái payment thành completed
            const updatedPayment = await Payment.findByIdAndUpdate(
                paymentId,
                { status: 'completed', completedAt: new Date() },
                { new: true, session }
            );

            console.log(`Đã cập nhật trạng thái thanh toán: ${updatedPayment._id} -> ${updatedPayment.status}`);

            // Tìm booking liên quan đến payment này - ưu tiên từ trường booking trong payment
            let booking;

            if (payment.booking) {
                console.log(`Tìm booking từ trường payment.booking: ${payment.booking}`);
                booking = await Booking.findById(payment.booking);

                if (booking) {
                    console.log(`Tìm thấy booking từ payment.booking: ${booking._id}, trạng thái: ${booking.status}`);
                } else {
                    console.log(`Không tìm thấy booking từ payment.booking, tìm kiếm theo paymentId...`);
                    booking = await Booking.findOne({ payment: paymentId });

                    if (booking) {
                        console.log(`Tìm thấy booking theo paymentId: ${booking._id}, trạng thái: ${booking.status}`);
                    }
                }
            } else {
                console.log(`Payment không có trường booking, tìm kiếm theo paymentId...`);
                booking = await Booking.findOne({ payment: paymentId });

                if (booking) {
                    console.log(`Tìm thấy booking theo paymentId: ${booking._id}, trạng thái: ${booking.status}`);

                    // Cập nhật lại trường booking trong payment
                    payment.booking = booking._id;
                    await payment.save({ session });
                    console.log(`Đã cập nhật trường booking trong payment: ${payment._id} -> ${booking._id}`);
                }
            }

            if (booking) {
                // Cập nhật trạng thái booking thành confirmed
                const updatedBooking = await Booking.findByIdAndUpdate(
                    booking._id,
                    { status: 'confirmed' },
                    { new: true, session }
                );
                console.log(`Đã cập nhật trạng thái booking: ${booking._id} -> ${updatedBooking.status}`);

                // Cập nhật trạng thái ghế trong showtime
                if (booking.showtime) {
                    // Đảm bảo các ghế đã được đánh dấu là booked trong showtime
                    const showtime = await Showtime.findById(booking.showtime);

                    if (showtime) {
                        console.log(`Tìm thấy showtime: ${showtime._id}`);

                        // Đảm bảo tất cả các ghế đã được đánh dấu
                        const bookingSeats = booking.seats.map(seat => seat.toString());
                        const existingBookedSeats = showtime.bookedSeats.map(seat => seat.toString());

                        // Thêm bất kỳ ghế nào chưa có trong bookedSeats
                        const seatsToAdd = bookingSeats.filter(seatId => !existingBookedSeats.includes(seatId));

                        if (seatsToAdd.length > 0) {
                            console.log(`Thêm ${seatsToAdd.length} ghế vào bookedSeats của showtime: ${showtime._id}`);
                            showtime.bookedSeats.push(...seatsToAdd);
                            await showtime.save({ session });
                            console.log(`Đã cập nhật showtime, thêm ghế vào bookedSeats`);
                        } else {
                            console.log(`Tất cả ghế đã có trong bookedSeats của showtime`);
                        }

                        // Cập nhật trạng thái ghế
                        for (const seatId of bookingSeats) {
                            await Seat.findByIdAndUpdate(
                                seatId,
                                { status: 'sold' },
                                { session }
                            );
                        }
                        console.log(`Đã cập nhật trạng thái ghế thành 'sold'`);
                    } else {
                        console.log(`Không tìm thấy showtime với ID: ${booking.showtime}`);
                    }
                } else {
                    console.log(`Booking không có thông tin showtime`);
                }
            } else {
                console.log(`Không tìm thấy booking liên quan đến payment: ${paymentId}`);
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();
            console.log(`Commit transaction thành công`);

            // Lấy showtime đầy đủ và cập nhật cho phản hồi
            let updatedShowtime = null;
            if (booking && booking.showtime) {
                try {
                    // Thực hiện truy vấn mới để lấy showtime với đầy đủ thông tin sau transaction
                    updatedShowtime = await Showtime.findById(booking.showtime)
                        .populate('movie')
                        .populate({
                            path: 'room',
                            populate: { path: 'cinema' }
                        });
                    console.log(`Đã lấy thông tin đầy đủ của showtime để trả về: ${updatedShowtime._id}`);
                } catch (err) {
                    console.error(`Lỗi khi lấy thông tin đầy đủ của showtime: ${err.message}`);
                    // Không fail request, chỉ ghi log lỗi
                }
            }

            return res.status(200).json({
                message: 'Cập nhật trạng thái thanh toán thành công',
                payment: updatedPayment,
                booking: booking ? {
                    _id: booking._id,
                    status: booking.status === 'pending' ? 'confirmed' : booking.status
                } : null,
                showtime: updatedShowtime // Thêm showtime được cập nhật đầy đủ thông tin
            });
        } catch (error) {
            // Rollback nếu có lỗi
            console.error("Lỗi trong transaction:", error);
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (err) {
        console.error("Lỗi cập nhật trạng thái thanh toán:", err);
        return res.status(500).json({
            message: 'Không thể cập nhật trạng thái thanh toán',
            error: err.message
        });
    }
}; 