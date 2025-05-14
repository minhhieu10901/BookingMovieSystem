import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMovieDetails, newBooking } from '../../api-helpers/api-helpers';
import { Box, Button, FormLabel, TextField, Typography } from '@mui/material';

const Booking = () => {
    const [movie, setMovie] = useState({});
    const [inputs, setInputs] = useState({ seatNumber: "", date: "" });
    const id = useParams().id;
    console.log(id);

    useEffect(() => {
        getMovieDetails(id)
            .then((res) => setMovie(res.movie))
            .catch((err) => console.log(err))
    }, [id])
    const handleChange = (e) => {
        setInputs((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(inputs);
        newBooking({ ...inputs, movie: movie._id })
            .then((res) => console.log(res))
            .catch((err) => console.log(err))
    };
    console.log(movie);
    return (
        <div>
            {movie && (
                <Fragment>
                    <Typography padding={3} fontFamily="fantasy" variant="h4" textAlign={"center"} >
                        Booking Tickets Of Movie: {movie.title}
                    </Typography>
                    <Box display="flex" justifyContent="center">
                        <Box
                            display="flex"
                            flexDirection="column"
                            paddingTop={3}
                            width="20%"
                        //marginRight={"auto"}
                        >
                            <img width={"100%"} height={"100%"} src={movie.posterUrl} alt={movie.title} />
                            <Box width={"100%"} marginTop={3} padding={1}>
                                <Typography paddingTop={2}>
                                    Genre: {movie.description}
                                </Typography>

                                <Typography fontWeight={"bold"} marginTop={1}>
                                    Actors: {movie.actors}
                                </Typography>
                                <Typography>
                                    ReleaseDate: {new Date(movie.releaseDate).toDateString("vi-VN")}
                                </Typography>
                            </Box>
                        </Box>
                        <Box width={"30%"} paddingTop={1}>
                            <form onSubmit={handleSubmit}>
                                <Box padding={5} margin={"auto"} display={"flex"} flexDirection="column" justifyContent={"center"} >
                                    <FormLabel>Seat Number</FormLabel>
                                    <TextField
                                        value={inputs.seatNumber}
                                        onChange={handleChange}
                                        name="seatNumber"
                                        type={"number"}
                                        margin="normal"
                                        variant="standard" />
                                    <FormLabel>Booking Date</FormLabel>
                                    <TextField
                                        value={inputs.date}
                                        onChange={handleChange}
                                        name="date"
                                        type={"date"}
                                        margin="normal"
                                        variant="standard" />
                                    <Button type={"submit"} sx={{ mt: 3, borderRadius: 4 }}>Book Now</Button>
                                </Box>
                            </form>
                        </Box>
                        <Box />
                    </Box>
                </Fragment>
            )}
        </div>
    );
}

export default Booking  