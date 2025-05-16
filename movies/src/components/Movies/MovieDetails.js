import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    Divider,
    Tabs,
    Tab,
    Button,
    Container,
    Grid,
    Paper,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Rating,
    Chip,
    Stack,
    useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import { getMovieDetails, getMovieShowtimes } from '../../api-helpers/api-helpers';

const MovieDetails = () => {
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(0);
    const [cinema, setCinema] = useState('all');
    const [location, setLocation] = useState('all');

    // Generate dates for the next 7 days starting from current date
    useEffect(() => {
        const generateDates = () => {
            const dateArray = [];
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);

                const dayName = i === 0 ? 'Hôm Nay' : days[date.getDay()];
                const dayNumber = date.getDate();
                const month = date.getMonth() + 1;

                dateArray.push({
                    fullDate: date,
                    display: dayName,
                    dateDisplay: `${dayNumber}/${month < 10 ? '0' + month : month}`
                });
            }

            setDates(dateArray);
        };

        generateDates();
    }, []);

    // Fetch movie details and showtimes
    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                if (id) {
                    const movieData = await getMovieDetails(id);
                    const showtimesData = await getMovieShowtimes(id);

                    setMovie(movieData.movie);
                    setShowtimes(Array.isArray(showtimesData) ? showtimesData : []);
                }
            } catch (err) {
                console.error("Failed to fetch movie data:", err);
            }
        };

        fetchMovieData();
    }, [id]);

    // Handle date change
    const handleDateChange = (event, newValue) => {
        setSelectedDate(newValue);
    };

    // Handle cinema filter change
    const handleCinemaChange = (event) => {
        setCinema(event.target.value);
    };

    // Handle location filter change
    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    // Filter showtimes based on selected date
    const filteredShowtimes = showtimes.filter(showtime => {
        const showtimeDate = new Date(showtime.date);
        const selectedDateValue = dates[selectedDate]?.fullDate;

        // Filter by selected date
        return (
            selectedDateValue &&
            showtimeDate.getDate() === selectedDateValue.getDate() &&
            showtimeDate.getMonth() === selectedDateValue.getMonth() &&
            showtimeDate.getFullYear() === selectedDateValue.getFullYear() &&
            (cinema === 'all' || showtime.cinema === cinema) &&
            (location === 'all' || showtime.location === location)
        );
    });

    // Group showtimes by cinema
    const showtimesByCinema = filteredShowtimes.reduce((acc, showtime) => {
        if (!acc[showtime.cinema]) {
            acc[showtime.cinema] = [];
        }
        acc[showtime.cinema].push(showtime);
        return acc;
    }, {});

    if (!movie) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>Loading...</Box>;
    }

    // Format genre items
    const genres = Array.isArray(movie.genre) ? movie.genre : (movie.genre ? [movie.genre] : []);

    return (
        <>
            <Container maxWidth="lg">
                {/* Movie Details Section */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                            <Typography variant="h1" sx={{ mb: 1 }}>
                                <strong>{movie.title}</strong>
                            </Typography>
                            <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                                Nội Dung Phim
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {movie.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <img src={movie.posterUrl} alt={movie.title} width="200px" height="300px" />
                            </Box>
                            <Box>

                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Đạo diễn:</strong> {movie.director}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Diễn viên:</strong> {Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Thể loại:</strong> {genres.join(', ')}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Thời lượng:</strong> {movie.duration} phút
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Ngày ra mắt:</strong> {movie.releaseDate}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Showtimes Section */}
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                                Lịch Chiếu
                            </Typography>

                            {/* Date Selection Tabs */}
                            <Box sx={{ position: 'relative', mb: 3 }}>
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1,
                                        bgcolor: theme.palette.background.paper,
                                        boxShadow: 1,
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        }
                                    }}
                                    disabled={selectedDate === 0}
                                    onClick={() => setSelectedDate(prev => Math.max(0, prev - 1))}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>

                                <Tabs
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    variant="scrollable"
                                    scrollButtons={false}
                                    sx={{
                                        px: 5,
                                        '& .MuiTab-root': {
                                            minWidth: 100,
                                            textAlign: 'center',
                                            textTransform: 'none',
                                            py: 1
                                        }
                                    }}
                                >
                                    {dates.map((date, index) => (
                                        <Tab
                                            key={index}
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {date.display}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {date.dateDisplay}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    ))}
                                </Tabs>

                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1,
                                        bgcolor: theme.palette.background.paper,
                                        boxShadow: 1,
                                        '&:hover': {
                                            bgcolor: theme.palette.background.paper,
                                        }
                                    }}
                                    disabled={selectedDate === dates.length - 1}
                                    onClick={() => setSelectedDate(prev => Math.min(dates.length - 1, prev + 1))}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            {/* Cinemas and Showtimes */}
                            {Object.keys(showtimesByCinema).length > 0 ? (
                                Object.entries(showtimesByCinema).map(([cinema, times]) => (
                                    <Box key={cinema} sx={{ mb: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                                            {cinema}
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />

                                        {/* Nhóm theo loại màn hình */}
                                        {Object.entries(
                                            times.reduce((acc, showtime) => {
                                                acc[showtime.screenType] = acc[showtime.screenType] || [];
                                                acc[showtime.screenType].push(showtime);
                                                return acc;
                                            }, {})
                                        ).map(([screenType, showtimes]) => (
                                            <Box key={screenType} sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {showtimes.map((showtime) => (
                                                        <Button
                                                            key={showtime.id}
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => navigate(`/booking/${showtime.id}`)}
                                                            sx={{
                                                                minWidth: 80,
                                                                borderRadius: 1,
                                                                fontWeight: 500,
                                                                color: theme.palette.text.primary,
                                                                borderColor: theme.palette.divider,
                                                                '&:hover': {
                                                                    borderColor: theme.palette.primary.main,
                                                                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                                }
                                                            }}
                                                        >
                                                            {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false
                                                            })}
                                                        </Button>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có suất chiếu cho ngày đã chọn
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default MovieDetails; 