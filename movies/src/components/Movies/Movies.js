import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getAllMovies } from "../../api-helpers/api-helpers";
import MovieItem from './MovieItem';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    getAllMovies()
      .then((data) => {
        setMovies(data.movies);
        setFilteredMovies(data.movies);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);
    const filtered = movies.filter(movie => {
      let genreString = '';
      if (Array.isArray(movie.genre)) {
        genreString = movie.genre.join(', ');
      } else if (typeof movie.genre === 'string') {
        genreString = movie.genre;
      }
      return (
        (movie.title && movie.title.toLowerCase().includes(query)) ||
        (genreString && genreString.toLowerCase().includes(query))
      );
    });
    setFilteredMovies(filtered);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 6, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 500
                }}
              >
                Tất cả phim
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm phim theo tên hoặc thể loại..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={3}>
          {filteredMovies.length === 0 ? (
            <Typography variant="body1" sx={{ ml: 2 }}>Không có phim nào phù hợp.</Typography>
          ) : (
            filteredMovies.map((movie) => (
              <Grid item xs={12} sm={6} md={3} key={movie._id}>
                <MovieItem
                  id={movie._id}
                  title={movie.title}
                  releaseDate={movie.releaseDate}
                  posterUrl={movie.posterUrl}
                  genre={Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                  rating={movie.rating}
                  duration={movie.duration}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Movies;