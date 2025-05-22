import axios from 'axios';
export const getAllMovies = async () => {
    const res = await axios
        .get("/api/movies")
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const data = await res.data;
    return data;
};

export const sendUserAuthRequest = async (data, signup) => {
    try {
        const res = await axios.post(`/api/users/${signup ? "signup" : "login"}`, {
            name: signup ? data.name : "",
            email: data.email,
            password: data.password,
        });

        return res.data;
    } catch (err) {
        console.log("Authentication error:", err.response?.data || err.message);
        return err.response?.data || {
            success: false,
            message: "Lỗi kết nối đến server"
        };
    }
}

export const sendAdminAuthRequest = async (data, signup) => {
    try {
        const res = await axios.post(`/api/admin/login`, {
            email: data.email,
            password: data.password,
        });

        return res.data;
    } catch (err) {
        console.log("Admin authentication error:", err.response?.data || err.message);
        return err.response?.data || {
            success: false,
            message: "Lỗi kết nối đến server"
        };
    }
}

export const getMovieDetails = async (id) => {
    const res = await axios.get(`/api/movies/${id}`)
        .catch((err) => console.log(err));

    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
}

export const newBooking = async (data) => {
    const res = await axios.post("/api/bookings", {
        movie: data.movie,
        seatNumber: data.seatNumber,
        date: data.date,
        user: localStorage.getItem("userId"),
    })
        .catch((err) => console.log(err));
    if (!res || res.status !== 201) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
}

export const getUserBookings = async () => {
    const id = localStorage.getItem("userId");
    if (!id) {
        console.error("No userId found in localStorage");
        return { bookings: [] };
    }
    const res = await axios
        .get(`/api/users/bookings/${id}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return { bookings: [] };
    }
    const resData = await res.data;
    return resData;
}

export const deleteBooking = async (id) => {
    const res = await axios
        .delete(`/api/bookings/${id}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
}
export const deleteMovie = async (id) => {
    try {
        const res = await axios.delete(`/api/movies/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể xóa phim");
        }

        return res.data;
    } catch (err) {
        console.error("Error deleting movie:", err.response?.data || err.message);
        throw err; // Ném lỗi để xử lý trong component
    }
}
export const getUserDetails = async () => {
    const id = localStorage.getItem("userId")
    const res = await axios
        .get(`/api/users/${id}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
}

export const getUserById = async (userId) => {
    try {
        const res = await axios.get(`/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin người dùng");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching user:", err.response?.data || err.message);
        return { success: false, message: "Không thể tải thông tin người dùng" };
    }
};

export const addMovie = async (data) => {
    try {
        const res = await axios.post("/api/movies", {
            title: data.title,
            description: data.description,
            releaseDate: data.releaseDate,
            posterUrl: data.posterUrl,
            trailerUrl: data.trailerUrl,
            featured: data.featured,
            director: data.director,
            duration: data.duration,
            genre: data.genre,
            rating: data.rating,
            status: data.status,
            actors: data.actors,
            admin: localStorage.getItem("adminId"),
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        return res.data;
    } catch (err) {
        console.error("Error adding movie:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Failed to add movie");
    }
};

export const getAdminById = async () => {
    const adminId = localStorage.getItem("adminId");
    const res = await axios
        .get(`/api/admin/${adminId}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("Unexpected Error Occurred")
    }
    const resData = await res.data;
    return resData;

}

export const addShowtime = async (data) => {
    try {
        const res = await axios.post("/api/showtimes", data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 201) {
            throw new Error("Không thể thêm suất chiếu");
        }

        return {
            success: true,
            message: "Thêm suất chiếu thành công",
            showtime: res.data.showtime
        };
    } catch (err) {
        console.error("Error adding showtime:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Thêm suất chiếu thất bại");
    }
};

export const getShowtimesByCinema = async (cinemaId, date) => {
    try {
        if (!cinemaId) {
            throw new Error("Vui lòng chọn rạp chiếu");
        }

        // Kiểm tra và đảm bảo ID có đúng định dạng
        if (!cinemaId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid cinema ID format:', cinemaId);
            return { showtimes: [] };
        }

        let url = `/api/showtimes/cinema/${cinemaId}`;
        if (date) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            url += `?date=${formattedDate}`;
        }

        console.log('Calling API:', url); // Debug log
        const res = await axios.get(url);

        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách suất chiếu");
        }
        return res.data;
    } catch (err) {
        console.error('Error fetching showtimes by cinema:', err);
        // Trả về mảng rỗng thay vì throw lỗi để tránh crash app
        return { showtimes: [] };
    }
};

export const updateShowtime = async (id, data) => {
    try {
        const res = await axios.put(`/api/showtimes/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể cập nhật suất chiếu");
        }

        return {
            success: true,
            message: "Cập nhật suất chiếu thành công",
            showtime: res.data.showtime
        };
    } catch (err) {
        console.error("Error updating showtime:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Cập nhật suất chiếu thất bại");
    }
};

export const deleteShowtime = async (id) => {
    try {
        const res = await axios.delete(`/api/showtimes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể xóa suất chiếu");
        }

        return {
            success: true,
            message: "Xóa suất chiếu thành công"
        };
    } catch (err) {
        console.error("Error deleting showtime:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Xóa suất chiếu thất bại");
    }
};

export const updateMovie = async (id, data) => {
    try {
        const res = await axios.put(`/api/movies/${id}`, {
            title: data.title,
            description: data.description,
            releaseDate: data.releaseDate,
            posterUrl: data.posterUrl,
            trailerUrl: data.trailerUrl,
            featured: data.featured,
            director: data.director,
            duration: data.duration,
            genre: data.genre,
            rating: data.rating,
            status: data.status,
            actors: data.actors,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 200) {
            return {
                success: true,
                message: "Cập nhật phim thành công",
                movie: res.data.movie || res.data
            };
        } else {
            return {
                success: false,
                message: res.data.message || "Cập nhật phim thất bại"
            };
        }
    } catch (err) {
        console.error("Error updating movie:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Cập nhật phim thất bại");
    }
};

// Cinema APIs
export const getAllCinemas = async () => {
    try {
        const res = await axios.get("/api/cinemas");
        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách rạp chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching cinemas:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải danh sách rạp chiếu");
    }
};

export const getCinemaById = async (id) => {
    try {
        const res = await axios.get(`/api/cinemas/${id}`);
        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin rạp chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching cinema:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải thông tin rạp chiếu");
    }
};

export const addCinema = async (data) => {
    try {
        const res = await axios.post("/api/cinemas", {
            name: data.name,
            address: data.address,
            city: data.city,
            phone: data.phone,
            email: data.email,
            status: data.status || 'active',
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 201) {
            return {
                success: true,
                message: "Thêm rạp chiếu thành công",
                cinema: res.data.cinema
            };
        } else {
            return {
                success: false,
                message: res.data.message || "Thêm rạp chiếu thất bại"
            };
        }
    } catch (err) {
        console.error("Error adding cinema:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Thêm rạp chiếu thất bại");
    }
};

export const updateCinema = async (id, data) => {
    try {
        const res = await axios.put(`/api/cinemas/${id}`, {
            name: data.name,
            address: data.address,
            city: data.city,
            phone: data.phone,
            email: data.email,
            status: data.status,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 200) {
            return {
                success: true,
                message: "Cập nhật rạp chiếu thành công",
                cinema: res.data.cinema
            };
        } else {
            return {
                success: false,
                message: res.data.message || "Cập nhật rạp chiếu thất bại"
            };
        }
    } catch (err) {
        console.error("Error updating cinema:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Cập nhật rạp chiếu thất bại");
    }
};

export const deleteCinema = async (id) => {
    try {
        const res = await axios.delete(`/api/cinemas/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 200) {
            return {
                success: true,
                message: "Xóa rạp chiếu thành công"
            };
        } else {
            throw new Error("Không thể xóa rạp chiếu");
        }
    } catch (err) {
        console.error("Error deleting cinema:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Xóa rạp chiếu thất bại");
    }
};

// Room APIs
export const getAllRooms = async () => {
    try {
        const res = await axios.get("/api/rooms");
        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách phòng chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching rooms:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải danh sách phòng chiếu");
    }
};

export const getRoomsByCinema = async (cinemaId) => {
    try {
        const res = await axios.get(`/api/rooms/cinema/${cinemaId}`);
        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách phòng chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching rooms by cinema:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải danh sách phòng chiếu");
    }
};

export const getRoomById = async (id) => {
    try {
        const res = await axios.get(`/api/rooms/${id}`);
        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin phòng chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching room:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải thông tin phòng chiếu");
    }
};

export const addRoom = async (data) => {
    try {
        const res = await axios.post("/api/rooms", {
            name: data.name,
            cinema: data.cinema,
            type: data.type,
            features: data.features || [],
            capacity: data.capacity,
            status: data.status || 'active',
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 201) {
            return {
                success: true,
                message: "Thêm phòng chiếu thành công",
                room: res.data.room
            };
        } else {
            return {
                success: false,
                message: res.data.message || "Thêm phòng chiếu thất bại"
            };
        }
    } catch (err) {
        console.error("Error adding room:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Thêm phòng chiếu thất bại");
    }
};

export const updateRoom = async (id, data) => {
    try {
        const res = await axios.put(`/api/rooms/${id}`, {
            name: data.name,
            type: data.type,
            features: data.features,
            capacity: data.capacity,
            status: data.status,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status === 200) {
            return {
                success: true,
                message: "Cập nhật phòng chiếu thành công",
                room: res.data.room
            };
        } else {
            return {
                success: false,
                message: res.data.message || "Cập nhật phòng chiếu thất bại"
            };
        }
    } catch (err) {
        console.error("Error updating room:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Cập nhật phòng chiếu thất bại");
    }
};

export const deleteRoom = async (id) => {
    try {
        const res = await axios.delete(`/api/rooms/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể xóa phòng chiếu");
        }

        return {
            success: true,
            message: "Xóa phòng chiếu thành công"
        };
    } catch (err) {
        console.error("Error deleting room:", err.response?.data || err.message);
        throw err;
    }
};

// Seat Management API functions
export const getSeatsByRoom = async (roomId, query = {}) => {
    try {
        let queryString = Object.keys(query)
            .filter(key => query[key] !== undefined && query[key] !== '')
            .map(key => `${key}=${query[key]}`)
            .join('&');

        const url = `/api/seats/room/${roomId}${queryString ? `?${queryString}` : ''}`;
        const res = await axios.get(url);

        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách ghế");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching seats:", err.response?.data || err.message);
        throw err;
    }
};

export const addSeats = async (data) => {
    try {
        const res = await axios.post("/api/seats", data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 201) {
            throw new Error("Không thể thêm ghế");
        }

        return {
            success: true,
            message: "Thêm ghế thành công",
            seats: res.data.seats
        };
    } catch (err) {
        console.error("Error adding seats:", err.response?.data || err.message);
        throw err;
    }
};

export const updateSeat = async (id, data) => {
    try {
        const res = await axios.put(`/api/seats/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể cập nhật ghế");
        }

        return {
            success: true,
            message: "Cập nhật ghế thành công",
            seat: res.data.seat
        };
    } catch (err) {
        console.error("Error updating seat:", err.response?.data || err.message);
        throw err;
    }
};

export const updateMultipleSeats = async (roomId, seats) => {
    try {
        const res = await axios.put(`/api/seats/room/${roomId}/bulk`, { seats }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể cập nhật ghế");
        }

        return {
            success: true,
            message: "Cập nhật ghế thành công",
            modifiedCount: res.data.modifiedCount
        };
    } catch (err) {
        console.error("Error updating seats:", err.response?.data || err.message);
        throw err;
    }
};

export const deleteSeats = async (roomId) => {
    try {
        const res = await axios.delete(`/api/seats/room/${roomId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể xóa ghế");
        }

        return {
            success: true,
            message: "Xóa ghế thành công"
        };
    } catch (err) {
        console.error("Error deleting seats:", err.response?.data || err.message);
        throw err;
    }
};

// Showtime API
export const getAllShowtimes = async () => {
    try {
        const res = await axios.get("/api/showtimes", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Could not fetch showtimes");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching showtimes:", err.response?.data || err.message);
        return { showtimes: [] };
    }
};

export const getShowtimesByRoom = async (roomId, date) => {
    try {
        if (!roomId) {
            throw new Error("Vui lòng chọn phòng chiếu");
        }

        // Kiểm tra và đảm bảo ID có đúng định dạng
        if (!roomId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid room ID format:', roomId);
            return { showtimes: [] };
        }

        let url = `/api/showtimes/room/${roomId}`;
        if (date) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            url += `?date=${formattedDate}`;
        }

        console.log('Calling API:', url); // Debug log
        const res = await axios.get(url);

        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách suất chiếu");
        }
        return res.data;
    } catch (err) {
        console.error('Error fetching showtimes by room:', err);
        // Trả về mảng rỗng thay vì throw lỗi để tránh crash app
        return { showtimes: [] };
    }
};

// Thêm các function API cho quản lý vé
export const getAllTickets = async () => {
    try {
        const res = await axios.get("/api/tickets", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách vé");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching tickets:", err.response?.data || err.message);
        return { tickets: [] };
    }
};

export const getTicketById = async (id) => {
    try {
        const res = await axios.get(`/api/tickets/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin vé");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching ticket:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải thông tin vé");
    }
};

export const addTicket = async (data) => {
    try {
        const res = await axios.post("/api/tickets", data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 201) {
            throw new Error("Không thể thêm vé mới");
        }

        return {
            success: true,
            message: "Thêm vé thành công",
            ticket: res.data.ticket
        };
    } catch (err) {
        console.error("Error adding ticket:", err.response?.data || err.message);
        return {
            success: false,
            message: err.response?.data?.message || "Thêm vé thất bại"
        };
    }
};

export const updateTicket = async (id, data) => {
    try {
        const res = await axios.put(`/api/tickets/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể cập nhật vé");
        }

        return {
            success: true,
            message: "Cập nhật vé thành công",
            ticket: res.data.ticket
        };
    } catch (err) {
        console.error("Error updating ticket:", err.response?.data || err.message);
        return {
            success: false,
            message: err.response?.data?.message || "Cập nhật vé thất bại"
        };
    }
};

export const deleteTicket = async (id) => {
    try {
        const res = await axios.delete(`/api/tickets/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể xóa vé");
        }

        return {
            success: true,
            message: "Xóa vé thành công"
        };
    } catch (err) {
        console.error("Error deleting ticket:", err.response?.data || err.message);
        return {
            success: false,
            message: err.response?.data?.message || "Xóa vé thất bại"
        };
    }
};

// Booking Management API functions
export const getAllBookings = async () => {
    try {
        const res = await axios.get("/api/bookings", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách đặt vé");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching bookings:", err.response?.data || err.message);
        return { bookings: [] };
    }
};

export const getBookingById = async (id) => {
    try {
        const res = await axios.get(`/api/bookings/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin đặt vé");
        }

        return res.data;
    } catch (err) {
        console.error("Error fetching booking:", err.response?.data || err.message);
        throw new Error(err.response?.data?.message || "Không thể tải thông tin đặt vé");
    }
};

export const cancelBooking = async (id) => {
    try {
        const res = await axios.post(`/api/bookings/${id}/cancel`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });

        if (res.status !== 200) {
            throw new Error("Không thể hủy đặt vé");
        }

        return {
            success: true,
            message: "Hủy đặt vé thành công",
            booking: res.data.booking
        };
    } catch (err) {
        console.error("Error cancelling booking:", err.response?.data || err.message);
        return {
            success: false,
            message: err.response?.data?.message || "Hủy đặt vé thất bại"
        };
    }
};

export const fetchShowtimesByMovie = async (movieId) => {
    try {
        const res = await axios.get(`/api/showtimes/movie/${movieId}`);
        return res.data;
    } catch (err) {
        console.log("Error fetching movie showtimes:", err);
    }
};

export const fetchCinemas = async () => {
    try {
        const res = await axios.get('/api/cinemas');
        return res.data;
    } catch (err) {
        console.log("Error fetching cinemas:", err);
    }
};

export const getMovieShowtimes = async (movieId) => {
    try {
        const res = await axios.get(`/api/movies/${movieId}/showtimes`);

        if (res.status !== 200) {
            console.log("Unexpected Error in getMovieShowtimes");
            return [];
        }

        const resData = await res.data;

        // Add debugging
        console.log("Movie showtimes API response:", resData);

        // Make sure we have an array of showtimes
        let showtimesArray = resData.showtimes || [];

        // Process the showtimes to ensure they have the required fields
        const processedShowtimes = showtimesArray.map(showtime => {
            // Ensure startTime is in the correct format
            let startTime = showtime.startTime;

            // Make sure critical fields exist
            return {
                ...showtime,
                id: showtime.id || showtime._id,
                date: showtime.date || new Date().toISOString().split('T')[0],
                startTime: startTime,
                cinema: showtime.cinema || "Unknown Cinema",
                screenType: showtime.screenType || "Standard"
            };
        });

        console.log("Processed showtimes:", processedShowtimes);
        return processedShowtimes;
    } catch (err) {
        console.error("Error in getMovieShowtimes:", err);
        return [];
    }
};

// Fetch showtime details by ID
export const getShowtimeById = async (id) => {
    try {
        const res = await axios.get(`/api/showtimes/${id}`);
        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin suất chiếu");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching showtime:", err.response?.data || err.message);
        throw err;
    }
};

// Get seats with availability for a specific showtime
export const getSeatsForShowtime = async (showtimeId) => {
    try {
        // First, get the showtime to find the room ID
        const showtimeData = await getShowtimeById(showtimeId);

        if (!showtimeData || !showtimeData.showtime) {
            throw new Error("Không thể tải thông tin suất chiếu");
        }

        // Extract room ID from showtime
        const roomId = typeof showtimeData.showtime.room === 'object'
            ? showtimeData.showtime.room._id || showtimeData.showtime.room.id
            : showtimeData.showtime.room;

        if (!roomId) {
            throw new Error("Không tìm thấy thông tin phòng chiếu");
        }

        // Get seats for this room
        return await getSeatsByRoom(roomId);
    } catch (err) {
        console.error("Error fetching seats for showtime:", err.response?.data || err.message);
        throw err;
    }
};

// User booking actions
export const createBooking = async (bookingData) => {
    try {
        // Lấy userId và accessToken từ localStorage
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId) {
            console.error("Missing userId in localStorage");
            const error = new Error("Vui lòng đăng nhập để đặt vé");
            error.requiresAuth = true;
            throw error;
        }

        // Thêm userId vào bookingData 
        const completeBookingData = {
            ...bookingData,
            user: userId
        };

        console.log("API - Sending booking data:", JSON.stringify(completeBookingData));

        // Thực hiện POST request với token xác thực
        console.log("API - Calling POST to /api/bookings");
        const res = await axios.post('/api/bookings', completeBookingData, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log("API - POST response status:", res.status);
        console.log("API - POST response data:", res.data);

        if (res.status !== 201) {
            console.error("API - Unexpected response status:", res.status);
            throw new Error(`Không thể tạo đơn đặt vé (status: ${res.status})`);
        }

        return res.data;
    } catch (err) {
        console.error("API - Error creating booking:", err);
        if (err.response) {
            console.error("API - Error response:", err.response.status, err.response.data);
            if (err.response.status === 401) {
                // Token hết hạn hoặc không hợp lệ
                const error = new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                error.requiresAuth = true;
                throw error;
            }
        }
        throw err;
    }
};

export const getTicketPrices = async () => {
    try {
        const res = await axios.get("/api/tickets");
        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin giá vé");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching ticket prices:", err.response?.data || err.message);
        return { tickets: [] };
    }
};

// Payment Management API functions
export const getAllPayments = async () => {
    try {
        const res = await axios.get('/api/payments/admin', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });
        if (res.status !== 200) {
            throw new Error("Không thể tải danh sách thanh toán");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching payments:", err.response?.data || err.message);
        throw err;
    }
};

export const getPaymentById = async (id) => {
    try {
        const res = await axios.get(`/api/payments/admin/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });
        if (res.status !== 200) {
            throw new Error("Không thể tải thông tin thanh toán");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching payment details:", err.response?.data || err.message);
        throw err;
    }
};

export const updatePaymentStatus = async (id, statusData) => {
    try {
        const res = await axios.patch(`/api/payments/admin/${id}/status`, statusData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });
        if (res.status !== 200) {
            throw new Error("Không thể cập nhật trạng thái thanh toán");
        }
        return res.data;
    } catch (err) {
        console.error("Error updating payment status:", err.response?.data || err.message);
        throw err;
    }
};

export const getPaymentStats = async () => {
    try {
        const res = await axios.get('/api/payments/admin/stats', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            }
        });
        if (res.status !== 200) {
            throw new Error("Không thể tải thống kê thanh toán");
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching payment stats:", err.response?.data || err.message);
        return { totalStats: [] };
    }
};

// Complete payment after successful transaction
export const completePayment = async (paymentId) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        if (!paymentId) {
            console.error("ID thanh toán không hợp lệ");
            throw new Error("ID thanh toán không hợp lệ");
        }

        console.log("Bắt đầu cập nhật thanh toán ID:", paymentId);

        // First try with PATCH request
        try {
            const res = await axios.patch(`/api/payments/complete/${paymentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            console.log("Phản hồi từ API thanh toán:", res.status, res.data);

            if (res.status === 200) {
                console.log("Cập nhật thanh toán thành công:", res.data);
                return {
                    success: true,
                    message: "Cập nhật trạng thái thanh toán thành công",
                    payment: res.data.payment,
                    booking: res.data.booking,
                    showtime: res.data.showtime
                };
            }
        } catch (patchError) {
            console.warn("PATCH request failed, attempting fallback:", patchError.message);

            // For development environment, try fallback to POST request if PATCH fails
            // This should be removed in production
            if (process.env.NODE_ENV !== 'production') {
                try {
                    console.log("Trying fallback POST request for payment completion");
                    const fallbackRes = await axios.post(`/api/payments/test/complete/${paymentId}`, {});

                    if (fallbackRes.status === 200) {
                        console.log("Fallback payment completion successful:", fallbackRes.data);
                        return {
                            success: true,
                            message: "Cập nhật trạng thái thanh toán thành công (fallback)",
                            payment: fallbackRes.data.payment,
                            booking: fallbackRes.data.booking,
                            showtime: fallbackRes.data.showtime
                        };
                    }
                } catch (fallbackError) {
                    console.error("Fallback POST request also failed:", fallbackError.message);
                    // Continue to general error handling
                }
            }
        }

        // If we get here, neither approach worked
        return {
            success: false,
            message: "Không thể cập nhật trạng thái thanh toán sau nhiều lần thử",
            error: "API errors"
        };

    } catch (err) {
        console.error("Lỗi cập nhật thanh toán:", err.response?.data || err.message);
        if (err.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            return {
                success: false,
                message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
                requiresAuth: true
            };
        }
        return {
            success: false,
            message: err.response?.data?.message || "Cập nhật trạng thái thanh toán thất bại",
            error: err.response?.data || err.message
        };
    }
};

export const getMostBookedMovies = async () => {
    try {
        const res = await axios.get("/api/movies/most-booked");
        if (!res || res.status !== 200) {
            console.log("Không thể lấy danh sách phim được đặt nhiều nhất");
            return { movies: [] };
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching most booked movies:", err.response?.data || err.message);
        return { movies: [] };
    }
};