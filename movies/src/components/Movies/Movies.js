import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Grid,
  Container,
  //Rating,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllMovies } from "../../api-helpers/api-helpers";
import { useSelector } from 'react-redux';

const Movies = () => {
  const navigate = useNavigate();
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllMovies()
      .then((data) => setMovies(data.movies))
      .catch((err) => console.log(err));
  }, []);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 500
            }}
          >
            Latest Movies
          </Typography>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: '300px' } }}
          />
        </Box>
        <Grid container spacing={2}>
          {filteredMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="400"
                  image={movie.posterUrl}
                  alt={movie.title}
                  sx={{
                    objectFit: 'cover',
                    borderBottom: '1px solid #eee'
                  }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 500,
                      mb: 1
                    }}
                  >
                    {movie.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {movie.description && movie.description.split(' ').slice(0, 20).join(' ')}
                    {movie.description && movie.description.split(' ').length > 20 ? '...' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {movie.actors && movie.actors.slice(0, 3).map((actor, index) => (
                      <Chip
                        key={index}
                        label={actor}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" />
                      <span>{movie.duration} mins</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DateRangeIcon fontSize="small" />
                      <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isUserLoggedIn ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/booking/${movie._id}`)}
                      sx={{ mt: 'auto' }}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/auth')}
                      sx={{ mt: 'auto' }}
                    >
                      Login to Book
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Movies;