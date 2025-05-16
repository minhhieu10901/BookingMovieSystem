import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import AdminLayout from '../AdminLayout';
import {
    getAllCinemas,
    getAllRooms,
    getAllMovies,
    getRoomsByCinema,
    getShowtimesByRoom,
    addShowtime
} from '../../../api-helpers/api-helpers';
import { format, isSameDay, addHours, setHours, setMinutes } from 'date-fns';

const ShowtimeManagement = () => {
    // State cho rạp chiếu và phòng chiếu
    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState('');
    const [loadingCinemas, setLoadingCinemas] = useState(false);

    // State cho phòng chiếu
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(false);

    // State cho suất chiếu
    const [allShowtimes, setAllShowtimes] = useState([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State cho dialog thêm suất chiếu
    const [openDialog, setOpenDialog] = useState(false);
    const [movies, setMovies] = useState([]);
    const [loadingMovies, setLoadingMovies] = useState(false);
    const [formData, setFormData] = useState({
        movie: '',
        cinema: '',
        room: '',
        date: new Date(),
        startTime: setHours(setMinutes(new Date(), 0), 9),
        endTime: setHours(setMinutes(new Date(), 0), 11),
        status: 'scheduled'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // State cho bộ lọc
    const [selectedDate, setSelectedDate] = useState(new Date());

    // State cho thông báo
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Fetch danh sách rạp chiếu
    const fetchCinemas = async () => {
        try {
            setLoadingCinemas(true);
            const data = await getAllCinemas();
            if (data && data.cinemas) {
                setCinemas(data.cinemas);
                // Set default cinema if available
                if (data.cinemas.length > 0) {
                    setSelectedCinema(data.cinemas[0]._id);
                    // Sau khi chọn rạp, fetch danh sách phòng
                    await fetchRoomsByCinema(data.cinemas[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching cinemas:', error);
            setError('Không thể tải danh sách rạp chiếu');
        } finally {
            setLoadingCinemas(false);
        }
    };

    // Fetch danh sách phòng theo rạp
    const fetchRoomsByCinema = async (cinemaId) => {
        if (!cinemaId) return;
        try {
            setLoadingRooms(true);
            const data = await getRoomsByCinema(cinemaId);
            if (data && data.rooms) {
                setRooms(data.rooms);
                // Tự động chọn phòng đầu tiên nếu có
                if (data.rooms.length > 0) {
                    setSelectedRoom(data.rooms[0]._id);
                } else {
                    setSelectedRoom('');
                }
            } else {
                setRooms([]);
                setSelectedRoom('');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setError('Không thể tải danh sách phòng chiếu');
            showSnackbar('Không thể tải danh sách phòng chiếu', 'error');
            setRooms([]);
            setSelectedRoom('');
        } finally {
            setLoadingRooms(false);
        }
    };

    // Fetch danh sách phim
    const fetchMovies = async () => {
        try {
            setLoadingMovies(true);
            const data = await getAllMovies();
            if (data && data.movies) {
                setMovies(data.movies);
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            showSnackbar('Không thể tải danh sách phim', 'error');
        } finally {
            setLoadingMovies(false);
        }
    };

    // Fetch suất chiếu theo phòng
    const fetchShowtimes = async () => {
        try {
            if (!selectedRoom) {
                setAllShowtimes([]);
                setFilteredShowtimes([]);
                return;
            }

            setLoading(true);
            setError(null);

            console.log('Fetching showtimes for room:', selectedRoom);
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const data = await getShowtimesByRoom(selectedRoom, formattedDate);

            if (data && data.showtimes) {
                console.log('Fetched showtimes:', data.showtimes.length);
                setAllShowtimes(data.showtimes);
                setFilteredShowtimes(data.showtimes);
            } else {
                setAllShowtimes([]);
                setFilteredShowtimes([]);
            }
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            setError(error.message || 'Không thể tải danh sách suất chiếu');
            setAllShowtimes([]);
            setFilteredShowtimes([]);
        } finally {
            setLoading(false);
        }
    };

    // Effect hooks
    useEffect(() => {
        fetchCinemas();
    }, []);

    // Khi người dùng chọn rạp, lấy danh sách phòng
    useEffect(() => {
        if (selectedCinema) {
            fetchRoomsByCinema(selectedCinema);
        }
    }, [selectedCinema]);

    // Khi người dùng chọn phòng hoặc ngày, lấy danh sách suất chiếu
    useEffect(() => {
        if (selectedRoom) {
            fetchShowtimes();
        }
    }, [selectedRoom, selectedDate]);

    // Handlers
    const handleCinemaChange = (event) => {
        setSelectedCinema(event.target.value);
        setSelectedRoom(''); // Reset room khi đổi rạp
        setPage(0);
    };

    const handleRoomChange = (event) => {
        setSelectedRoom(event.target.value);
        setPage(0);
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Format time for display
    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Dialog handlers
    const handleOpenDialog = () => {
        fetchMovies();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({
            movie: '',
            cinema: '',
            room: '',
            date: new Date(),
            startTime: setHours(setMinutes(new Date(), 0), 9),
            endTime: setHours(setMinutes(new Date(), 0), 11),
            status: 'scheduled'
        });
        setFormErrors({});
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Nếu thay đổi rạp chiếu, load danh sách phòng
        if (name === 'cinema') {
            setFormData(prev => ({
                ...prev,
                room: ''
            }));
            fetchRoomsByCinema(value);
        }
    };

    const handleDatePickerChange = (newDate) => {
        setFormData(prev => ({
            ...prev,
            date: newDate
        }));
    };

    const handleTimePickerChange = (name, newTime) => {
        setFormData(prev => ({
            ...prev,
            [name]: newTime
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.movie) errors.movie = 'Vui lòng chọn phim';
        if (!formData.cinema) errors.cinema = 'Vui lòng chọn rạp chiếu';
        if (!formData.room) errors.room = 'Vui lòng chọn phòng chiếu';
        if (!formData.date) errors.date = 'Vui lòng chọn ngày chiếu';
        if (!formData.startTime) errors.startTime = 'Vui lòng chọn giờ bắt đầu';
        if (!formData.endTime) errors.endTime = 'Vui lòng chọn giờ kết thúc';

        // Kiểm tra endTime > startTime
        if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
            errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            // Combine date and time for API
            const combinedStartTime = new Date(formData.date);
            combinedStartTime.setHours(
                formData.startTime.getHours(),
                formData.startTime.getMinutes(),
                0
            );

            const combinedEndTime = new Date(formData.date);
            combinedEndTime.setHours(
                formData.endTime.getHours(),
                formData.endTime.getMinutes(),
                0
            );

            const showtimeData = {
                movie: formData.movie,
                room: formData.room,
                date: formData.date,
                startTime: combinedStartTime,
                endTime: combinedEndTime,
                status: formData.status
            };

            const response = await addShowtime(showtimeData);

            if (response.success) {
                showSnackbar('Thêm suất chiếu thành công');
                handleCloseDialog();
                fetchShowtimes(); // Refresh danh sách
            } else {
                showSnackbar(response.message || 'Thêm suất chiếu thất bại', 'error');
            }
        } catch (error) {
            console.error('Error adding showtime:', error);
            showSnackbar(error.message || 'Thêm suất chiếu thất bại', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const content = (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Quản lý suất chiếu
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        Thêm suất chiếu
                    </Button>
                </Box>

                {/* Filter Box */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Rạp chiếu</InputLabel>
                                <Select
                                    value={selectedCinema}
                                    onChange={handleCinemaChange}
                                    label="Rạp chiếu"
                                >
                                    {loadingCinemas ? (
                                        <MenuItem disabled>Đang tải...</MenuItem>
                                    ) : (
                                        cinemas.map((cinema) => (
                                            <MenuItem key={cinema._id} value={cinema._id}>
                                                {cinema.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Phòng chiếu</InputLabel>
                                <Select
                                    value={selectedRoom}
                                    onChange={handleRoomChange}
                                    label="Phòng chiếu"
                                    disabled={!selectedCinema || loadingRooms}
                                >
                                    {loadingRooms ? (
                                        <MenuItem disabled>Đang tải...</MenuItem>
                                    ) : rooms.length === 0 ? (
                                        <MenuItem disabled>Không có phòng chiếu</MenuItem>
                                    ) : (
                                        rooms.map((room) => (
                                            <MenuItem key={room._id} value={room._id}>
                                                {room.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <DatePicker
                                    label="Ngày chiếu"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    format="dd/MM/yyyy"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined"
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Showtimes Table */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            Đang tải danh sách suất chiếu...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 3 }}>
                        {error}
                    </Alert>
                ) : filteredShowtimes.length === 0 ? (
                    <Alert severity="info" sx={{ my: 3 }}>
                        {selectedRoom ? 'Không có suất chiếu nào cho phòng và ngày đã chọn' : 'Vui lòng chọn phòng chiếu để xem danh sách suất chiếu'}
                    </Alert>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Phim</TableCell>
                                    <TableCell>Phòng chiếu</TableCell>
                                    <TableCell>Giờ chiếu</TableCell>
                                    <TableCell>Ghế đã đặt</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredShowtimes
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((showtime) => (
                                        <TableRow key={showtime._id}>
                                            <TableCell>{showtime.movie?.title || 'N/A'}</TableCell>
                                            <TableCell>{showtime.room?.name || 'N/A'}</TableCell>
                                            <TableCell>{formatTime(showtime.startTime)}</TableCell>
                                            <TableCell>{showtime.bookedSeats?.length || 0}</TableCell>
                                            <TableCell>
                                                {new Date(showtime.startTime) < new Date() ? 'Đã chiếu' : 'Sắp chiếu'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredShowtimes.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số hàng mỗi trang:"
                        />
                    </TableContainer>
                )}
            </Box>

            {/* Dialog thêm suất chiếu */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Thêm suất chiếu mới</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.movie}>
                                <InputLabel>Phim</InputLabel>
                                <Select
                                    name="movie"
                                    value={formData.movie}
                                    onChange={handleFormChange}
                                    label="Phim"
                                >
                                    {loadingMovies ? (
                                        <MenuItem value="" disabled>Đang tải...</MenuItem>
                                    ) : (
                                        movies.map((movie) => (
                                            <MenuItem key={movie._id} value={movie._id}>
                                                {movie.title}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {formErrors.movie && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.movie}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.cinema}>
                                <InputLabel>Rạp chiếu</InputLabel>
                                <Select
                                    name="cinema"
                                    value={formData.cinema}
                                    onChange={handleFormChange}
                                    label="Rạp chiếu"
                                >
                                    {loadingCinemas ? (
                                        <MenuItem value="" disabled>Đang tải...</MenuItem>
                                    ) : (
                                        cinemas.map((cinema) => (
                                            <MenuItem key={cinema._id} value={cinema._id}>
                                                {cinema.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {formErrors.cinema && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.cinema}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.room}>
                                <InputLabel>Phòng chiếu</InputLabel>
                                <Select
                                    name="room"
                                    value={formData.room}
                                    onChange={handleFormChange}
                                    label="Phòng chiếu"
                                    disabled={!formData.cinema || loadingRooms}
                                >
                                    {loadingRooms ? (
                                        <MenuItem value="" disabled>Đang tải...</MenuItem>
                                    ) : (
                                        rooms.map((room) => (
                                            <MenuItem key={room._id} value={room._id}>
                                                {room.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {formErrors.room && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.room}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.status}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                                    <MenuItem value="completed">Đã hoàn thành</MenuItem>
                                </Select>
                                {formErrors.status && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.status}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <DatePicker
                                    label="Ngày chiếu"
                                    value={formData.date}
                                    onChange={handleDatePickerChange}
                                    format="dd/MM/yyyy"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!formErrors.date,
                                            helperText: formErrors.date
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <TimePicker
                                    label="Giờ bắt đầu"
                                    value={formData.startTime}
                                    onChange={(newTime) => handleTimePickerChange('startTime', newTime)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!formErrors.startTime,
                                            helperText: formErrors.startTime
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <TimePicker
                                    label="Giờ kết thúc"
                                    value={formData.endTime}
                                    onChange={(newTime) => handleTimePickerChange('endTime', newTime)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!formErrors.endTime,
                                            helperText: formErrors.endTime
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang xử lý...' : 'Thêm suất chiếu'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default ShowtimeManagement; 