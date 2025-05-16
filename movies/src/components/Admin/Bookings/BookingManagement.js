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
    IconButton,
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
    Chip,
    InputAdornment,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import AdminLayout from '../AdminLayout';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmailIcon from '@mui/icons-material/Email';
import { format } from 'date-fns';
import {
    getAllBookings,
    getBookingById,
    cancelBooking
} from '../../../api-helpers/api-helpers';

const BookingManagement = () => {
    // State for bookings list
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [showFilter, setShowFilter] = useState(null);

    // State for booking details dialog
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

    // State for cancel booking dialog
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // State for snackbar notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Fetch all bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllBookings();

            if (data && data.bookings) {
                setBookings(data.bookings);
                setFilteredBookings(data.bookings);
            } else {
                setBookings([]);
                setFilteredBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError(error.message || 'Không thể tải danh sách đặt vé');
        } finally {
            setLoading(false);
        }
    };

    // Fetch booking details
    const fetchBookingDetails = async (bookingId) => {
        try {
            setLoading(true);
            const data = await getBookingById(bookingId);

            if (data && data.booking) {
                setSelectedBooking(data.booking);
                setOpenDetailsDialog(true);
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            showSnackbar('Không thể tải chi tiết đặt vé', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Effect hooks
    useEffect(() => {
        fetchBookings();
    }, []);

    // Effect for filtering bookings
    useEffect(() => {
        if (bookings.length === 0) return;

        let result = [...bookings];

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(booking =>
                booking.user?.name?.toLowerCase().includes(searchLower) ||
                booking.user?.email?.toLowerCase().includes(searchLower) ||
                booking._id?.toLowerCase().includes(searchLower) ||
                booking.showtime?.movie?.title?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(booking => booking.status === statusFilter);
        }

        // Filter by date
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            result = result.filter(booking => {
                const bookingDate = new Date(booking.bookingDate);
                return bookingDate.toDateString() === filterDate.toDateString();
            });
        }

        // Filter by show date (future implementation)
        if (showFilter) {
            // TODO: Implement filtering by show date
        }

        setFilteredBookings(result);
        setPage(0); // Reset to first page when filters change
    }, [bookings, searchTerm, statusFilter, dateFilter, showFilter]);

    // Handlers
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleDateFilterChange = (newDate) => {
        setDateFilter(newDate);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDetailsDialog = (booking) => {
        fetchBookingDetails(booking._id);
    };

    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedBooking(null);
    };

    const handleOpenCancelDialog = (booking) => {
        setBookingToCancel(booking);
        setOpenCancelDialog(true);
    };

    const handleCloseCancelDialog = () => {
        setOpenCancelDialog(false);
        setBookingToCancel(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        try {
            setCancelling(true);
            const response = await cancelBooking(bookingToCancel._id);

            if (response.success) {
                showSnackbar('Hủy đặt vé thành công');
                handleCloseCancelDialog();
                fetchBookings(); // Refresh list
            } else {
                showSnackbar(response.message || 'Hủy đặt vé thất bại', 'error');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showSnackbar(error.message || 'Hủy đặt vé thất bại', 'error');
        } finally {
            setCancelling(false);
        }
    };

    // Send email notification to customer (for future implementation)
    const handleSendEmail = (booking) => {
        showSnackbar('Chức năng gửi email sẽ được phát triển sau');
    };

    // Print ticket (for future implementation)
    const handlePrintTicket = (booking) => {
        showSnackbar('Chức năng in vé sẽ được phát triển sau');
    };

    // Status chips
    const getStatusChip = (status) => {
        switch (status) {
            case 'pending':
                return <Chip label="Chờ xác nhận" color="warning" size="small" />;
            case 'confirmed':
                return <Chip label="Đã xác nhận" color="success" size="small" />;
            case 'cancelled':
                return <Chip label="Đã hủy" color="error" size="small" />;
            default:
                return <Chip label={status} color="default" size="small" />;
        }
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
        } catch (error) {
            return 'N/A';
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format seat numbers for display
    const formatSeats = (seats) => {
        if (!seats || !Array.isArray(seats) || seats.length === 0) return 'N/A';

        if (seats.length <= 3) {
            return seats.map(seat => seat.seatNumber || seat).join(', ');
        } else {
            return `${seats.slice(0, 3).map(seat => seat.seatNumber || seat).join(', ')} +${seats.length - 3} ghế khác`;
        }
    };

    const content = (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Quản lý đặt vé
                    </Typography>
                </Box>

                {/* Filter Box */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                            <TextField
                                fullWidth
                                label="Tìm kiếm"
                                variant="outlined"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Tìm theo tên, email, phim..."
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                                    <MenuItem value="pending">Chờ xác nhận</MenuItem>
                                    <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <DatePicker
                                    label="Ngày đặt vé"
                                    value={dateFilter}
                                    onChange={handleDateFilterChange}
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
                        <Grid item xs={12} md={6} lg={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter(null);
                                    setShowFilter(null);
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Bookings Table */}
                {loading && !openDetailsDialog && !openCancelDialog ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            Đang tải danh sách đặt vé...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 3 }}>
                        {error}
                    </Alert>
                ) : filteredBookings.length === 0 ? (
                    <Alert severity="info" sx={{ my: 3 }}>
                        Không tìm thấy đặt vé nào
                    </Alert>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã đặt vé</TableCell>
                                    <TableCell>Khách hàng</TableCell>
                                    <TableCell>Phim</TableCell>
                                    <TableCell>Suất chiếu</TableCell>
                                    <TableCell>Ghế</TableCell>
                                    <TableCell>Tổng tiền</TableCell>
                                    <TableCell>Ngày đặt</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBookings
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((booking) => (
                                        <TableRow key={booking._id}>
                                            <TableCell>
                                                {booking._id.substring(booking._id.length - 6).toUpperCase()}
                                            </TableCell>
                                            <TableCell>
                                                {booking.user?.name || 'N/A'}
                                                <br />
                                                <Typography variant="caption" color="textSecondary">
                                                    {booking.user?.email || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{booking.showtime?.movie?.title || 'N/A'}</TableCell>
                                            <TableCell>
                                                {formatDateTime(booking.showtime?.startTime)}
                                                <br />
                                                <Typography variant="caption" color="textSecondary">
                                                    {booking.showtime?.room?.name || 'N/A'} - {booking.showtime?.room?.cinema?.name || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{formatSeats(booking.seats)}</TableCell>
                                            <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                                            <TableCell>{formatDateTime(booking.bookingDate)}</TableCell>
                                            <TableCell>{getStatusChip(booking.status)}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDetailsDialog(booking)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {booking.status !== 'cancelled' && (
                                                    <Tooltip title="Hủy đặt vé">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleOpenCancelDialog(booking)}
                                                        >
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Gửi email">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => handleSendEmail(booking)}
                                                    >
                                                        <EmailIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="In vé">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handlePrintTicket(booking)}
                                                    >
                                                        <ReceiptIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredBookings.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số hàng mỗi trang:"
                        />
                    </TableContainer>
                )}
            </Box>

            {/* Booking Details Dialog */}
            <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Chi tiết đặt vé #{selectedBooking?._id.substring(selectedBooking?._id.length - 6).toUpperCase()}
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                            <CircularProgress />
                        </Box>
                    ) : selectedBooking ? (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {/* Thông tin khách hàng */}
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin khách hàng
                                    </Typography>
                                    <List dense disablePadding>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Họ tên"
                                                secondary={selectedBooking.user?.name || 'N/A'}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Email"
                                                secondary={selectedBooking.user?.email || 'N/A'}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Số điện thoại"
                                                secondary={selectedBooking.user?.phone || 'N/A'}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>

                            {/* Thông tin đặt vé */}
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin đặt vé
                                    </Typography>
                                    <List dense disablePadding>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Mã đặt vé"
                                                secondary={selectedBooking._id}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Ngày đặt"
                                                secondary={formatDateTime(selectedBooking.bookingDate)}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Trạng thái"
                                                secondary={getStatusChip(selectedBooking.status)}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>

                            {/* Thông tin phim và suất chiếu */}
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin phim và suất chiếu
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body2" color="text.secondary">Phim:</Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {selectedBooking.showtime?.movie?.title || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body2" color="text.secondary">Thời gian:</Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {formatDateTime(selectedBooking.showtime?.startTime)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body2" color="text.secondary">Phòng chiếu:</Typography>
                                            <Typography variant="body1" gutterBottom>
                                                {selectedBooking.showtime?.room?.name || 'N/A'} - {selectedBooking.showtime?.room?.cinema?.name || 'N/A'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Thông tin ghế */}
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin ghế
                                    </Typography>
                                    <List dense>
                                        {selectedBooking.seats && selectedBooking.seats.length > 0 ? (
                                            selectedBooking.seats.map((seat, index) => (
                                                <ListItem key={index} disablePadding sx={{ pb: 1 }}>
                                                    <ListItemText
                                                        primary={`Ghế ${seat.seatNumber || seat}`}
                                                        secondary={seat.type || 'Thường'}
                                                    />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Không có thông tin ghế</Typography>
                                        )}
                                    </List>
                                </Paper>
                            </Grid>

                            {/* Thông tin thanh toán */}
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin thanh toán
                                    </Typography>
                                    <List dense>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Phương thức thanh toán"
                                                secondary={selectedBooking.payment?.method || 'N/A'}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Trạng thái thanh toán"
                                                secondary={selectedBooking.payment?.status || 'N/A'}
                                            />
                                        </ListItem>
                                        <ListItem disablePadding sx={{ pb: 1 }}>
                                            <ListItemText
                                                primary="Tổng tiền"
                                                secondary={formatCurrency(selectedBooking.totalAmount)}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography>Không có thông tin chi tiết</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedBooking && selectedBooking.status !== 'cancelled' && (
                        <Button
                            onClick={() => {
                                handleCloseDetailsDialog();
                                handleOpenCancelDialog(selectedBooking);
                            }}
                            color="error"
                        >
                            Hủy đặt vé
                        </Button>
                    )}
                    <Button onClick={handleCloseDetailsDialog} color="primary" variant="contained">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
                <DialogTitle>Xác nhận hủy đặt vé</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn hủy đặt vé này không? Hành động này không thể hoàn tác.
                    </Typography>
                    {bookingToCancel && (
                        <Box mt={2}>
                            <Typography variant="body2">
                                <strong>Mã đặt vé:</strong> {bookingToCancel._id.substring(bookingToCancel._id.length - 6).toUpperCase()}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Khách hàng:</strong> {bookingToCancel.user?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Phim:</strong> {bookingToCancel.showtime?.movie?.title || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Suất chiếu:</strong> {formatDateTime(bookingToCancel.showtime?.startTime)}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Tổng tiền:</strong> {formatCurrency(bookingToCancel.totalAmount)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelDialog} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleCancelBooking}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                    >
                        {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
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

export default BookingManagement; 