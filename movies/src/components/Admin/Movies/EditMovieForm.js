import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Grid,
    Paper,
    Alert,
    AlertTitle,
    Snackbar,
    Divider,
    IconButton,
    InputAdornment,
    Card,
    CardContent,
    CardMedia,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    MovieCreation as MovieIcon,
    People as PeopleIcon,
    CalendarMonth as CalendarIcon,
    Photo as PhotoIcon,
    Star as StarIcon,
    Settings as SettingsIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { getMovieDetails, updateMovie } from '../../../api-helpers/api-helpers';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

const genres = [
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Horror',
    'Musical',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'War',
    'Western'
];

const EditMovieForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);

    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        posterUrl: "",
        trailerUrl: "",
        releaseDate: "",
        director: "",
        duration: "",
        genre: "",
        rating: "",
        status: "coming_soon",
        featured: false
    });

    const [actors, setActors] = useState([]);
    const [actor, setActor] = useState("");
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                const movieData = await getMovieDetails(id);

                if (movieData && movieData.movie) {
                    const movie = movieData.movie;

                    // Format date to YYYY-MM-DD for input field
                    const formatDate = (dateString) => {
                        if (!dateString) return "";
                        const date = new Date(dateString);
                        return date.toISOString().split('T')[0];
                    };

                    setInputs({
                        title: movie.title || "",
                        description: movie.description || "",
                        posterUrl: movie.posterUrl || "",
                        trailerUrl: movie.trailerUrl || "",
                        releaseDate: formatDate(movie.releaseDate),
                        director: movie.director || "",
                        duration: movie.duration?.toString() || "",
                        genre: movie.genre || "",
                        rating: movie.rating?.toString() || "",
                        status: movie.status || "coming_soon",
                        featured: movie.featured || false
                    });

                    if (movie.actors && Array.isArray(movie.actors)) {
                        setActors(movie.actors);
                    }
                } else {
                    throw new Error("Không thể tải thông tin phim");
                }
            } catch (error) {
                console.error("Error fetching movie:", error);
                setLoadingError(error.message || "Đã xảy ra lỗi khi tải thông tin phim");
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    // Validation helpers
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Tiêu đề phim là bắt buộc';
                else if (value.length > 100) error = 'Tiêu đề không được vượt quá 100 ký tự';
                break;

            case 'description':
                if (!value.trim()) error = 'Mô tả phim là bắt buộc';
                break;

            case 'posterUrl':
                if (!value.trim()) error = 'URL poster là bắt buộc';
                else if (!value.match(/^(http|https):\/\/[^ "]+$/))
                    error = 'URL poster không hợp lệ';
                break;

            case 'duration':
                if (!value) error = 'Thời lượng phim là bắt buộc';
                else if (isNaN(value) || Number(value) <= 0)
                    error = 'Thời lượng phải là số dương';
                break;

            case 'director':
                if (!value.trim()) error = 'Tên đạo diễn là bắt buộc';
                break;

            case 'genre':
                if (!value) error = 'Thể loại phim là bắt buộc';
                break;

            case 'releaseDate':
                if (!value) error = 'Ngày phát hành là bắt buộc';
                break;

            case 'rating':
                if (value && (isNaN(value) || Number(value) < 0 || Number(value) > 10))
                    error = 'Đánh giá phải từ 0 đến 10';
                break;

            case 'actors':
                if (actors.length === 0) error = 'Phải có ít nhất một diễn viên';
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        // Update the input state without triggering validation on every keystroke
        setInputs(prev => ({ ...prev, [name]: newValue }));

        // Only validate after a short delay to avoid focus loss
        // This ensures validation runs after typing stops, not during typing
        const error = validateField(name, newValue);
        if (error !== errors[name]) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleActorAdd = () => {
        if (actor.trim() && !actors.includes(actor)) {
            setActors([...actors, actor]);
            setActor("");
            setErrors(prev => ({ ...prev, actors: '' }));
        }
    };

    const handleActorKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleActorAdd();
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(inputs).forEach(key => {
            const error = validateField(key, inputs[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        // Validate actors list
        const actorsError = validateField('actors', actors);
        if (actorsError) {
            newErrors.actors = actorsError;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                severity: 'error'
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await updateMovie(id, { ...inputs, actors });
            console.log("API response:", result);

            if (result && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Cập nhật phim thành công!',
                    severity: 'success'
                });

                // Redirect to movie management after successful submission
                setTimeout(() => {
                    navigate('/movies-management');
                }, 2000);
            } else {
                throw new Error(result?.message || 'Cập nhật phim thất bại');
            }
        } catch (error) {
            console.error("Error updating movie:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Đã xảy ra lỗi khi cập nhật phim',
                severity: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/movies-management');
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Đang tải thông tin phim...
                    </Typography>
                </Box>
            </AdminLayout>
        );
    }

    if (loadingError) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                        <AlertTitle>Lỗi</AlertTitle>
                        {loadingError}
                        <Box mt={2}>
                            <Button variant="outlined" onClick={() => navigate('/movies-management')}>
                                Quay lại quản lý phim
                            </Button>
                        </Box>
                    </Alert>
                </Box>
            </AdminLayout>
        );
    }

    // Section components for better organization
    const BasicInfoSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <MovieIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Thông tin cơ bản
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tên phim"
                            name="title"
                            value={inputs.title}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.title}
                            helperText={errors.title}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Mô tả phim"
                            name="description"
                            value={inputs.description}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            multiline
                            rows={4}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Đạo diễn"
                            name="director"
                            value={inputs.director}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.director}
                            helperText={errors.director}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Thời lượng (phút)"
                            name="duration"
                            type="number"
                            value={inputs.duration}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.duration}
                            helperText={errors.duration}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Đánh giá"
                            name="rating"
                            type="number"
                            value={inputs.rating}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            error={!!errors.rating}
                            helperText={errors.rating || "Thang điểm 0-10"}
                            inputProps={{ step: 0.1, min: 0, max: 10 }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end"><StarIcon fontSize="small" color="warning" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" required error={!!errors.genre}>
                            <InputLabel>Thể loại</InputLabel>
                            <Select
                                label="Thể loại"
                                name="genre"
                                value={inputs.genre}
                                onChange={handleChange}
                            >
                                {genres.map((genre) => (
                                    <MenuItem key={genre} value={genre}>
                                        {genre}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.genre && <FormHelperText>{errors.genre}</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const ActorsSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Diễn viên
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tên diễn viên"
                            value={actor}
                            onChange={(e) => setActor(e.target.value)}
                            onKeyPress={handleActorKeyPress}
                            variant="outlined"
                            fullWidth
                            error={!!errors.actors}
                            helperText={errors.actors}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            onClick={handleActorAdd}
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            disabled={!actor.trim()}
                                        >
                                            <AddIcon />
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 1,
                            minHeight: '50px',
                            p: actors.length ? 2 : 0,
                            bgcolor: actors.length ? 'action.hover' : 'transparent',
                            borderRadius: 1
                        }}>
                            {actors.length > 0 ? (
                                actors.map((a, index) => (
                                    <Chip
                                        key={index}
                                        label={a}
                                        onDelete={() => setActors(actors.filter((actor) => actor !== a))}
                                        color="primary"
                                        variant="outlined"
                                        sx={{ m: 0.5 }}
                                    />
                                ))
                            ) : (
                                <Typography color="text.secondary" sx={{ p: 2 }}>
                                    Chưa có diễn viên nào được thêm
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const MediaSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <PhotoIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Hình ảnh và lịch chiếu
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={inputs.posterUrl && inputs.posterUrl.match(/^(http|https):\/\/[^ "]+$/) ? 8 : 12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ngày phát hành"
                                    name="releaseDate"
                                    type="date"
                                    value={inputs.releaseDate}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    error={!!errors.releaseDate}
                                    helperText={errors.releaseDate}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="URL Poster"
                                    name="posterUrl"
                                    value={inputs.posterUrl}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    error={!!errors.posterUrl}
                                    helperText={errors.posterUrl}
                                    placeholder="https://example.com/poster.jpg"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="URL Trailer (tùy chọn)"
                                    name="trailerUrl"
                                    value={inputs.trailerUrl}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Preview poster if URL is valid */}
                    {inputs.posterUrl && inputs.posterUrl.match(/^(http|https):\/\/[^ "]+$/) && (
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                                Xem trước poster:
                            </Typography>
                            <Card sx={{ height: '100%', maxHeight: 400 }}>
                                <CardMedia
                                    component="img"
                                    src={inputs.posterUrl}
                                    alt="Movie Poster Preview"
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300x450?text=Invalid+Image+URL';
                                    }}
                                />
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );

    const StatusSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <SettingsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Trạng thái
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                label="Trạng thái"
                                name="status"
                                value={inputs.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="coming_soon">Sắp chiếu</MenuItem>
                                <MenuItem value="now_showing">Đang chiếu</MenuItem>
                                <MenuItem value="ended">Đã kết thúc</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="featured"
                                    checked={inputs.featured}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label="Đánh dấu là phim đặc sắc"
                            sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const formContent = (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton
                        onClick={handleCancel}
                        sx={{ mr: 2 }}
                        color="primary"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Cập nhật phim
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <BasicInfoSection />
                <ActorsSection />
                <MediaSection />
                <StatusSection />

                <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={submitting}
                        size="large"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        size="large"
                        startIcon={<SaveIcon />}
                    >
                        {submitting ? 'Đang cập nhật...' : 'Cập nhật phim'}
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );

    return <AdminLayout>{formContent}</AdminLayout>;
};

export default EditMovieForm; 