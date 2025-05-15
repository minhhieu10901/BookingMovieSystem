import { Box, Button, Checkbox, FormLabel, TextField, Typography, Select, MenuItem, Chip, Snackbar } from '@mui/material';
import React, { useState } from 'react';
import { addMovie } from '../../api-helpers/api-helpers';


const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

const AddMovie = () => {
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        posterUrl: "",
        trailerUrl: "",
        releaseDate: "",
        endDate: "",
        director: "",
        duration: "",
        language: "",
        genre: "",
        rating: "",
        status: "coming_soon",
        featured: false
    });

    const [actors, setActors] = useState([]);
    const [actor, setActor] = useState("");

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleActorAdd = () => {
        if (actor.trim() && !actors.includes(actor)) {
            setActors([...actors, actor]);
            setActor("");
        }
    };
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputs.title.trim() || !inputs.description.trim() || !inputs.posterUrl.trim() || !inputs.director.trim() || !inputs.duration.trim()) {
            console.error("Missing required fields");
            return;
        }
        if (actors.length === 0) {
            console.error("Actors list cannot be empty");
            return;
        }
        if (inputs.rating < 0 || inputs.rating > 10) {
            console.error("Rating must be between 0 and 10");
            return;
        }

        addMovie({ ...inputs, actors })
        .then((res) => {
            if (res) {
                setOpenSnackbar(true); // Hiển thị thông báo
                console.log("✅ Movie added successfully!", res);
            } else {
                console.error("❌ Failed to add movie!");
            }
        })
        .catch((err) => console.error("❌ API Error:", err));
    };

    return (
        <Box width="60%" padding={5} margin="auto" boxShadow="10px 10px 20px #ccc">
            <Typography textAlign="center" variant="h5" fontFamily="verdana">
                Add New Movie
            </Typography>
            <form onSubmit={handleSubmit}>
                {['title', 'description', 'posterUrl', 'trailerUrl', 'director'].map((field) => (
                    <Box key={field}>
                        <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                        <TextField value={inputs[field]} onChange={handleChange} name={field} variant="standard" fullWidth margin="normal" />
                    </Box>
                ))}

                <FormLabel>Duration (minutes)</FormLabel>
                <TextField type="number" value={inputs.duration} onChange={handleChange} name="duration" variant="standard" fullWidth margin="normal" />

                <FormLabel>Language</FormLabel>
                <TextField value={inputs.language} onChange={handleChange} name="language" variant="standard" fullWidth margin="normal" />

                <FormLabel>Genre</FormLabel>
                <Select value={inputs.genre} onChange={handleChange} name="genre" fullWidth variant="standard">
                    {genres.map((g) => (
                        <MenuItem key={g} value={g}>{g}</MenuItem>
                    ))}
                </Select>

                <FormLabel>Release Date</FormLabel>
                <TextField type="date" value={inputs.releaseDate} onChange={handleChange} name="releaseDate" variant="standard" fullWidth margin="normal" />

                <FormLabel>End Date</FormLabel>
                <TextField type="date" value={inputs.endDate} onChange={handleChange} name="endDate" variant="standard" fullWidth margin="normal" />

                <FormLabel>Actors</FormLabel>
                <Box display="flex">
                    <TextField value={actor} onChange={(e) => setActor(e.target.value)} variant="standard" fullWidth margin="normal" />
                    <Button onClick={handleActorAdd}>Add</Button>
                </Box>
                <Box display="flex" flexWrap="wrap">
                    {actors.map((a, index) => (
                        <Chip key={index} label={a} onDelete={() => setActors(actors.filter((actor) => actor !== a))} sx={{ m: 0.5 }} />
                    ))}
                </Box>

                <FormLabel>Rating (0-10)</FormLabel>
                <TextField type="number" value={inputs.rating} onChange={handleChange} name="rating" variant="standard" fullWidth margin="normal" />

                <FormLabel>Status</FormLabel>
                <Select value={inputs.status} onChange={handleChange} name="status" fullWidth variant="standard">
                    <MenuItem value="coming_soon">Coming Soon</MenuItem>
                    <MenuItem value="now_showing">Now Showing</MenuItem>
                    <MenuItem value="ended">Ended</MenuItem>
                </Select>

                <FormLabel>Featured</FormLabel>
                <Checkbox name="featured" checked={inputs.featured} onClick={(e) => setInputs((prevState) => ({ ...prevState, featured: e.target.checked }))} />

                <Button type="submit" variant="contained" sx={{ mt: 2, width: "100%", bgcolor: "#2d2b42", ":hover": { backgroundColor: "#121217" } }}>
                    Add Movie
                </Button>
            </form>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="✅ Movie added successfully!"
            />
        </Box>
    );
};

export default AddMovie;
