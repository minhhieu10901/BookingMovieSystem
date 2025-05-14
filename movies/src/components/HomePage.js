import { Box, Button, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import MovieItem from './Movies/MovieItem'
import { Link } from 'react-router-dom'
import { getAllMovies } from '../api-helpers/api-helpers'

const HomePage = () => {
    const [movies, setMovies] = React.useState([])
    useEffect(() => {
        getAllMovies()
            .then((data) => {
                if (data && data.movies) {
                    setMovies(data.movies);
                }
            })
            .catch((err) => console.error("Error fetching movies:", err));
    }, []);
    return <Box width={"100%"} height="100%" margin="auto" marginTop={2}>
        <Box margin={'auto'} width="80%" height={"50vh"} padding={2}>
            <img src="https://collider.com/wp-content/uploads/inception_movie_poster_banner_01.jpg"
                width={"100%"}
                height={"100%"}
                alt="Inception"></img>
        </Box>
        <Box padding={5} margin={"auto"}>
            <Typography variant="h4" textAlign={"center"}>Last Releases</Typography>
        </Box>
        <Box display="flex" width="100%" justifyContent={"center"} flexWrap="wrap">
            {movies && movies.slice(0, 4).map((movie, index) => (
                <MovieItem
                    key={movie._id}
                    id={movie._id}
                    title={movie.title}
                    releaseDate={movie.releaseDate}
                    posterUrl={movie.posterUrl}
                />
            ))}
        </Box>
        <Box display="flex" padding={5} margin={"auto"}>
            <Button LinkComponent={Link} to="/movies" variant="outlined" sx={{ margin: "auto", color: "2E3B55" }}>
                View All Movies
            </Button>
        </Box>
    </Box>

}

export default HomePage