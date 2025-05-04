import { Box, Typography } from '@mui/material'
import React, {useEffect, useState } from 'react'
import { getAllMovies } from '../../api-helpers/api-helpers';
import MovieItem from './MovieItem';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    getAllMovies()
      .then((data) => setMovies(data.movies))
      .catch((err) => console.log(err)); 
  }, [])
  return <Box margin="auto" marginTop={4}>
    <Typography
      variant='h4'
      margin={"auto"}
      width={"40%"}
      bgcolor={"#900C3F"}
      color='white'
      textAlign={"center"}
      padding={2}>All Movies
    </Typography>
    <Box width={"100%"} margin={"auto"} marginTop={5} justifyContent={"flex-start"} display={"flex"} flexWrap="wrap" paddingLeft="10%" >
      {movies && movies.map((movie, index) =>
        <MovieItem
        key={index} 
        id={movie.id} 
        title={movie.title} 
        releaseDate={movie.releaseDate} 
        posterUrl={movie.posterUrl} />)}
    </Box>
  </Box>

};

export default Movies;