import Showtime from "../models/Showtime.js";
import Movie from "../models/Movie.js";
import Room from "../models/Room.js";
import Cinema from "../models/Cinema.js";
import mongoose from "mongoose";

// Lấy chi tiết một suất chiếu
export const getShowtimeById = async (req, res) => {
    try {
        const { id } = req.params;
        const showtime = await Showtime.findById(id)
            .populate('movie', 'title poster duration')
            .populate('room', 'name type')
            .populate('cinema', 'name address')
            .populate('bookedSeats', 'seatNumber row column type status');

        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: "Showtime not found"
            });
        }

        return res.status(200).json({
            success: true,
            showtime
        });
    } catch (error) {
        console.error('Error in getShowtimeById:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching showtime",
            error: error.message
        });
    }
};

// Tạo suất chiếu mới
export const addShowtime = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { movie, room, date, startTime, endTime, price } = req.body;

        // Validate required fields
        if (!movie || !room || !date || !startTime || !endTime || !price) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Find movie and room
        const [existingMovie, existingRoom] = await Promise.all([
            Movie.findById(movie),
            Room.findById(room).populate('cinema')
        ]);

        if (!existingMovie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }
        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Check for time conflicts
        const showtimeDate = new Date(date);
        const startDateTime = new Date(showtimeDate);
        const [startHours, startMinutes] = startTime.split(':');
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

        const endDateTime = new Date(showtimeDate);
        const [endHours, endMinutes] = endTime.split(':');
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        // Check if end time is after start time
        if (endDateTime <= startDateTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        // Check for overlapping showtimes
        const overlappingShowtime = await Showtime.findOne({
            room,
            date: showtimeDate,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (overlappingShowtime) {
            return res.status(400).json({
                success: false,
                message: "Time slot overlaps with existing showtime"
            });
        }

        // Create showtime
        const showtime = new Showtime({
            movie,
            room,
            cinema: existingRoom.cinema._id,
            date: showtimeDate,
            startTime,
            endTime,
            price,
            status: 'scheduled',
            bookedSeats: []
        });

        // Save showtime
        const savedShowtime = await showtime.save({ session });

        // Update movie and room references
        await Promise.all([
            Movie.findByIdAndUpdate(movie,
                { $push: { showtimes: savedShowtime._id } },
                { session }
            ),
            Room.findByIdAndUpdate(room,
                { $push: { showtimes: savedShowtime._id } },
                { session }
            )
        ]);

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Showtime created successfully",
            showtime: savedShowtime
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in addShowtime:', error);
        return res.status(500).json({
            success: false,
            message: "Error creating showtime",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Cập nhật suất chiếu
export const updateShowtime = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { date, startTime, endTime, price, status } = req.body;

        const showtime = await Showtime.findById(id);
        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: "Showtime not found"
            });
        }

        // Check if showtime can be updated
        if (showtime.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: "Cannot update completed showtime"
            });
        }

        // If updating time, check for conflicts
        if (date || startTime || endTime) {
            const showtimeDate = date ? new Date(date) : showtime.date;
            const newStartTime = startTime || showtime.startTime;
            const newEndTime = endTime || showtime.endTime;

            const startDateTime = new Date(showtimeDate);
            const [startHours, startMinutes] = newStartTime.split(':');
            startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

            const endDateTime = new Date(showtimeDate);
            const [endHours, endMinutes] = newEndTime.split(':');
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

            // Check if end time is after start time
            if (endDateTime <= startDateTime) {
                return res.status(400).json({
                    success: false,
                    message: "End time must be after start time"
                });
            }

            // Check for overlapping showtimes
            const overlappingShowtime = await Showtime.findOne({
                _id: { $ne: id },
                room: showtime.room,
                date: showtimeDate,
                $or: [
                    {
                        startTime: { $lt: newEndTime },
                        endTime: { $gt: newStartTime }
                    }
                ]
            });

            if (overlappingShowtime) {
                return res.status(400).json({
                    success: false,
                    message: "Time slot overlaps with existing showtime"
                });
            }
        }

        // Update showtime
        if (date) showtime.date = new Date(date);
        if (startTime) showtime.startTime = startTime;
        if (endTime) showtime.endTime = endTime;
        if (price) showtime.price = price;
        if (status) showtime.status = status;

        const updatedShowtime = await showtime.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Showtime updated successfully",
            showtime: updatedShowtime
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in updateShowtime:', error);
        return res.status(500).json({
            success: false,
            message: "Error updating showtime",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Xóa suất chiếu
export const deleteShowtime = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const showtime = await Showtime.findById(id);
        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: "Showtime not found"
            });
        }

        // Check if showtime can be deleted
        if (showtime.status === 'completed' || showtime.bookedSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete showtime that is completed or has bookings"
            });
        }

        // Remove showtime references from movie and room
        await Promise.all([
            Movie.findByIdAndUpdate(showtime.movie,
                { $pull: { showtimes: showtime._id } },
                { session }
            ),
            Room.findByIdAndUpdate(showtime.room,
                { $pull: { showtimes: showtime._id } },
                { session }
            )
        ]);

        // Delete showtime
        await Showtime.findByIdAndDelete(id, { session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Showtime deleted successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in deleteShowtime:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting showtime",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Lấy danh sách suất chiếu theo rạp
export const getShowtimesByCinema = async (req, res) => {
    try {
        const { cinemaId } = req.params;
        const { movie, date, status } = req.query;

        // Kiểm tra rạp có tồn tại không
        const cinema = await Cinema.findById(cinemaId);
        if (!cinema) {
            return res.status(404).json({
                success: false,
                message: "Rạp chiếu không tồn tại"
            });
        }

        // Xây dựng query
        let query = { cinema: cinemaId };

        // Thêm các điều kiện lọc nếu có
        if (movie) query.movie = movie;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }
        if (status) query.status = status;

        // Tìm các suất chiếu và populate thông tin liên quan
        const showtimes = await Showtime.find(query)
            .populate('movie', 'title poster duration')
            .populate({
                path: 'room',
                select: 'name type capacity',
                populate: {
                    path: 'cinema',
                    select: 'name address'
                }
            })
            .sort({ date: 1, startTime: 1 });

        // Tính toán trạng thái của từng suất chiếu
        const now = new Date();
        const showtimesWithStatus = showtimes.map(showtime => {
            const showtimeDate = new Date(showtime.date);
            const [hours, minutes] = showtime.startTime.split(':');
            showtimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            let status = 'upcoming';
            if (showtimeDate < now) {
                status = 'completed';
            } else if (showtimeDate.getTime() - now.getTime() <= 30 * 60 * 1000) { // 30 phút
                status = 'starting';
            }

            return {
                ...showtime.toObject(),
                currentStatus: status
            };
        });

        return res.status(200).json({
            success: true,
            showtimes: showtimesWithStatus,
            cinema: {
                _id: cinema._id,
                name: cinema.name,
                address: cinema.address
            }
        });
    } catch (error) {
        console.error('Error in getShowtimesByCinema:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách suất chiếu",
            error: error.message
        });
    }
};

// Lấy danh sách suất chiếu theo phòng
export const getShowtimesByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { date, status } = req.query;

        // Kiểm tra phòng có tồn tại không
        const room = await Room.findById(roomId).populate('cinema');
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Phòng chiếu không tồn tại"
            });
        }

        // Xây dựng query
        let query = { room: roomId };

        // Thêm các điều kiện lọc nếu có
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }
        if (status) query.status = status;

        // Tìm các suất chiếu và populate thông tin liên quan
        const showtimes = await Showtime.find(query)
            .populate('movie', 'title poster duration')
            .populate({
                path: 'room',
                select: 'name type capacity',
                populate: {
                    path: 'cinema',
                    select: 'name address'
                }
            })
            .sort({ date: 1, startTime: 1 });

        // Tính toán trạng thái của từng suất chiếu
        const now = new Date();
        const showtimesWithStatus = showtimes.map(showtime => {
            const showtimeDate = new Date(showtime.date);
            const [hours, minutes] = showtime.startTime.split(':');
            showtimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            let status = 'upcoming';
            if (showtimeDate < now) {
                status = 'completed';
            } else if (showtimeDate.getTime() - now.getTime() <= 30 * 60 * 1000) { // 30 phút
                status = 'starting';
            }

            return {
                ...showtime.toObject(),
                currentStatus: status
            };
        });

        return res.status(200).json({
            success: true,
            showtimes: showtimesWithStatus,
            room: {
                _id: room._id,
                name: room.name,
                cinema: {
                    _id: room.cinema._id,
                    name: room.cinema.name
                }
            }
        });
    } catch (error) {
        console.error('Error in getShowtimesByRoom:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách suất chiếu",
            error: error.message
        });
    }
};