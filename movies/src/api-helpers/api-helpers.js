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
    const res = await axios
        .post(`/api/users/${signup ? "signup" : "login"}`, {
            name: signup ? data.name : "",
            email: data.email,
            password: data.password,
        })
        .catch((err) => console.log(err));
    if (!res || (res.status !== 200 && res.status !== 201)) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
}
export const sendAdminAuthRequest = async (data, signup) => {
    const res = await axios
        .post(`/api/admin/login`, {
            email: data.email,
            password: data.password,
        })
        .catch((err) => console.log(err));
    if (!res || (res.status !== 200 && res.status !== 201)) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
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
    const res = await axios
        .delete(`/api/movies/${id}`)
        .catch((err) => console.log(err));
    if (!res || res.status !== 200) {
        return console.log("No data found");
    }
    const resData = await res.data;
    return resData;
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
            endDate: data.endDate,
            posterUrl: data.posterUrl,
            trailerUrl: data.trailerUrl,
            featured: data.featured,
            director: data.director,
            duration: data.duration,
            language: data.language,
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
        return null;
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