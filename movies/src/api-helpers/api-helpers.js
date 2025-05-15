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
            language: "Unknown",
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
    const res = await axios.post("/api/showtimes", {
        movie: data.movie,
        date: data.date,
        time: data.time,
        screen: data.screen,
        price: data.price,
    })
        .catch((err) => console.log(err));
    if (!res || res.status !== 201) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
};

export const getShowtimesByMovie = async (movieId) => {
    const res = await axios
        .get(`/api/showtimes/movie/${movieId}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
};

export const updateShowtime = async (id, data) => {
    const res = await axios
        .put(`/api/showtimes/${id}`, data)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
};

export const deleteShowtime = async (id) => {
    const res = await axios
        .delete(`/api/showtimes/${id}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
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
            language: "Unknown",
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