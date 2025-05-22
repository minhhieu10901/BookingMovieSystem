import { Box, Button, Typography, TextField, Grid, Container, Paper, InputAdornment, IconButton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MovieItem from './Movies/MovieItem'
import { Link } from 'react-router-dom'
import { getAllMovies, getMostBookedMovies } from '../api-helpers/api-helpers'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const HomePage = () => {
    const [movies, setMovies] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredMovies, setFilteredMovies] = useState([])
    const [nowShowingMovies, setNowShowingMovies] = useState([])
    const [comingSoonMovies, setComingSoonMovies] = useState([])
    const [mostBookedMovies, setMostBookedMovies] = useState([])

    useEffect(() => {
        getAllMovies()
            .then((data) => {
                if (data && data.movies) {
                    setMovies(data.movies)
                    setFilteredMovies(data.movies)
                    setNowShowingMovies(data.movies.filter(movie => movie.status === 'now_showing'))
                    setComingSoonMovies(data.movies.filter(movie => movie.status === 'coming_soon'))
                }
            })
            .catch((err) => console.error("Error fetching movies:", err))

        // Fetch most booked movies
        getMostBookedMovies()
            .then((data) => {
                if (data && data.movies) {
                    setMostBookedMovies(data.movies)
                }
            })
            .catch((err) => console.error("Error fetching most booked movies:", err))
    }, [])

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = movies.filter(movie => {
            // Xử lý genre là mảng hoặc string
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
        setNowShowingMovies(filtered.filter(movie => movie.status === 'now_showing'));
        setComingSoonMovies(filtered.filter(movie => movie.status === 'coming_soon'));
    }

    const bannerMovies = [
        {
            id: 1,
            title: "Inception",
            image: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"
        },
        {
            id: 2,
            title: "Avengers: Endgame",
            image: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg"
        },
        {
            id: 3,
            title: "Interstellar",
            image: "https://image.tmdb.org/t/p/w1280/djS3XxneEFjCM6VlCiuuN8QavE6.jpg"
        }
    ]

    return (
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
            {/* Banner Section */}
            <Box sx={{
                height: { xs: "40vh", md: "60vh" },
                mt: 2,
                mb: 6,
                position: 'relative',
                zIndex: 1
            }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                >
                    {bannerMovies.map((movie) => (
                        <SwiperSlide key={movie.id}>
                            <Box
                                sx={{
                                    height: "100%",
                                    position: "relative",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        background: "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7))"
                                    }
                                }}
                            >
                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            {/* Search and Filter Section */}
            <Paper elevation={3} sx={{ p: 2, mb: 6, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search movies by title or genre..."
                            value={searchQuery}
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
                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<FilterListIcon />}
                            sx={{ height: "56px" }}
                        >
                            Filter Movies
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Most Booked Movies Section */}
            <Box sx={{ mb: 6, position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WhatshotIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: 'error.main' }}>
                        Phim Được Đặt Nhiều Nhất
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {mostBookedMovies.length === 0 ? (
                        <Typography variant="body1" sx={{ ml: 2 }}>Không có dữ liệu phim.</Typography>
                    ) : (
                        mostBookedMovies.map((movie) => (
                            <Grid item xs={12} sm={6} md={4} key={movie._id}>
                                <MovieItem
                                    id={movie._id}
                                    title={movie.title}
                                    releaseDate={movie.releaseDate}
                                    posterUrl={movie.posterUrl}
                                    genre={Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                                    rating={movie.rating}
                                    duration={movie.duration}
                                    badge={`Đặt ${movie.bookingCount || 0} lần`}
                                    highlighted={true}
                                />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>

            {/* Now Showing Section */}
            <Box sx={{ mb: 6, position: 'relative', zIndex: 2 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                    Now Showing
                </Typography>
                <Grid container spacing={3}>
                    {nowShowingMovies.length === 0 ? (
                        <Typography variant="body1" sx={{ ml: 2 }}>Không có phim đang chiếu.</Typography>
                    ) : (
                        nowShowingMovies.slice(0, 10).map((movie) => (
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

            {/* Coming Soon Section */}
            <Box sx={{ mb: 6, position: 'relative', zIndex: 2 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                    Coming Soon
                </Typography>
                <Grid container spacing={3}>
                    {comingSoonMovies.length === 0 ? (
                        <Typography variant="body1" sx={{ ml: 2 }}>Không có phim sắp chiếu.</Typography>
                    ) : (
                        comingSoonMovies.slice(0, 10).map((movie) => (
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

            {/* View All Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4, position: 'relative', zIndex: 2 }}>
                <Button
                    component={Link}
                    to="/movies"
                    variant="contained"
                    size="large"
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1.1rem"
                    }}
                >
                    View All Movies
                </Button>
            </Box>
        </Container>
    )
}

export default HomePage