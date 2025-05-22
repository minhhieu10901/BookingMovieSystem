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
    ListItemText,
    Card,
    CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import AdminLayout from '../AdminLayout';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';
import {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    getPaymentStats
} from '../../../api-helpers/api-helpers';

const PaymentManagement = () => {
    // State for payments list
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // State for payment detail dialog
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // State for update status dialog
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // State for statistics
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        totalAmount: 0
    });

    // State for snackbar notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, []);

    // Filter payments when filters change
    useEffect(() => {
        applyFilters();
    }, [payments, searchTerm, statusFilter, paymentMethodFilter, fromDate, toDate]);

    // Fetch all payments
    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getAllPayments();
            if (data && data.payments) {
                setPayments(data.payments);
                setFilteredPayments(data.payments);
            } else {
                setPayments([]);
                setFilteredPayments([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setError("Không thể tải danh sách thanh toán");
            setLoading(false);
        }
    };

    // Fetch payment statistics
    const fetchStats = async () => {
        try {
            const data = await getPaymentStats();
            if (data) {
                const processedStats = {
                    total: 0,
                    completed: 0,
                    pending: 0,
                    failed: 0,
                    refunded: 0,
                    totalAmount: 0
                };

                // Process total stats from response
                if (data.totalStats) {
                    data.totalStats.forEach(stat => {
                        processedStats.total += stat.count || 0;

                        if (stat._id === 'completed') {
                            processedStats.completed = stat.count || 0;
                            processedStats.totalAmount = stat.totalAmount || 0;
                        } else if (stat._id === 'pending') {
                            processedStats.pending = stat.count || 0;
                        } else if (stat._id === 'failed') {
                            processedStats.failed = stat.count || 0;
                        } else if (stat._id === 'refunded') {
                            processedStats.refunded = stat.count || 0;
                        }
                    });
                }

                setStats(processedStats);
            }
        } catch (error) {
            console.error('Error fetching payment stats:', error);
        }
    };

    // Apply all filters to the payments
    const applyFilters = () => {
        if (payments.length === 0) return;

        let filtered = [...payments];

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(payment =>
                (payment._id && payment._id.toLowerCase().includes(searchLower)) ||
                (payment.user?.name && payment.user.name.toLowerCase().includes(searchLower)) ||
                (payment.user?.email && payment.user.email.toLowerCase().includes(searchLower)) ||
                (payment.transactionId && payment.transactionId.toLowerCase().includes(searchLower)) ||
                (payment.showtime?.movie?.title && payment.showtime.movie.title.toLowerCase().includes(searchLower))
            );
        }

        // Filter by status
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        // Filter by payment method
        if (paymentMethodFilter && paymentMethodFilter !== 'all') {
            filtered = filtered.filter(payment => payment.paymentMethod === paymentMethodFilter);
        }

        // Filter by date range
        if (fromDate) {
            const fromDateObj = new Date(fromDate);
            fromDateObj.setHours(0, 0, 0, 0);
            filtered = filtered.filter(payment => new Date(payment.paymentDate) >= fromDateObj);
        }

        if (toDate) {
            const toDateObj = new Date(toDate);
            toDateObj.setHours(23, 59, 59, 999);
            filtered = filtered.filter(payment => new Date(payment.paymentDate) <= toDateObj);
        }

        setFilteredPayments(filtered);
        setPage(0); // Reset to first page when filters change
    };

    // Get payment details
    const fetchPaymentDetails = async (paymentId) => {
        try {
            setLoadingDetail(true);
            const data = await getPaymentById(paymentId);

            if (data && data.payment) {
                setSelectedPayment(data.payment);
                setOpenDetailsDialog(true);
            } else {
                showSnackbar('Không thể tải thông tin thanh toán', 'error');
            }

            setLoadingDetail(false);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            showSnackbar('Không thể tải thông tin thanh toán', 'error');
            setLoadingDetail(false);
        }
    };

    // Update payment status
    const handleUpdateStatus = async () => {
        if (!selectedPayment || !newStatus) return;

        try {
            setUpdatingStatus(true);

            const statusData = {
                status: newStatus,
                ...(newStatus === 'refunded' && refundReason ? { refundReason } : {})
            };

            const result = await updatePaymentStatus(selectedPayment._id, statusData);

            if (result.success) {
                showSnackbar('Cập nhật trạng thái thanh toán thành công');

                // Update payment in the list
                setPayments(prev => prev.map(p =>
                    p._id === selectedPayment._id ? { ...p, status: newStatus } : p
                ));

                // If dialog is open with this payment, update it there too
                if (openDetailsDialog && selectedPayment) {
                    setSelectedPayment({
                        ...selectedPayment,
                        status: newStatus,
                        refundReason: newStatus === 'refunded' ? refundReason : selectedPayment.refundReason,
                        refundDate: newStatus === 'refunded' ? new Date() : selectedPayment.refundDate
                    });
                }

                // Refresh stats
                fetchStats();
                handleCloseStatusDialog();
            } else {
                showSnackbar(result.message || 'Cập nhật trạng thái thất bại', 'error');
            }

            setUpdatingStatus(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            showSnackbar('Cập nhật trạng thái thất bại', 'error');
            setUpdatingStatus(false);
        }
    };

    // Event handlers
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handlePaymentMethodFilterChange = (event) => {
        setPaymentMethodFilter(event.target.value);
    };

    const handleFromDateChange = (newDate) => {
        setFromDate(newDate);
    };

    const handleToDateChange = (newDate) => {
        setToDate(newDate);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentMethodFilter('all');
        setFromDate(null);
        setToDate(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDetailsDialog = (payment) => {
        fetchPaymentDetails(payment._id);
    };

    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedPayment(null);
    };

    const handleOpenStatusDialog = (payment) => {
        setSelectedPayment(payment);
        setNewStatus(payment.status);
        setRefundReason('');
        setOpenStatusDialog(true);
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
        setNewStatus('');
        setRefundReason('');
    };

    // Send email receipt (placeholder)
    const handleSendEmail = (payment) => {
        showSnackbar('Chức năng gửi email sẽ được phát triển sau');
    };

    // Print receipt (placeholder)
    const handlePrintReceipt = (payment) => {
        showSnackbar('Chức năng in biên lai sẽ được phát triển sau');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
        } catch (error) {
            return 'N/A';
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return <Chip label="Đã thanh toán" color="success" size="small" />;
            case 'pending':
                return <Chip label="Đang xử lý" color="warning" size="small" />;
            case 'failed':
                return <Chip label="Thất bại" color="error" size="small" />;
            case 'refunded':
                return <Chip label="Đã hoàn tiền" color="info" size="small" />;
            default:
                return <Chip label={status} color="default" size="small" />;
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'credit_card': return 'Thẻ tín dụng';
            case 'debit_card': return 'Thẻ ghi nợ';
            case 'cash': return 'Tiền mặt';
            case 'momo': return 'Ví MoMo';
            case 'zalopay': return 'ZaloPay';
            case 'bank_transfer': return 'Chuyển khoản';
            default: return method;
        }
    };

    const formatSeats = (seats) => {
        if (!seats || !Array.isArray(seats) || seats.length === 0) return 'N/A';

        if (seats.length <= 3) {
            return seats.map(seat => seat.seatNumber || `${seat.row}${seat.column}` || seat).join(', ');
        } else {
            const firstThree = seats.slice(0, 3).map(seat => seat.seatNumber || `${seat.row}${seat.column}` || seat).join(', ');
            return `${firstThree} +${seats.length - 3} ghế khác`;
        }
    };

    const content = (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Quản lý thanh toán
                    </Typography>
                </Box>

                {/* Dashboard Statistics */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Tổng thanh toán
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {stats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Đã thanh toán
                                </Typography>
                                <Typography variant="h5" component="div" color="success.main">
                                    {stats.completed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Đang xử lý
                                </Typography>
                                <Typography variant="h5" component="div" color="warning.main">
                                    {stats.pending}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Thất bại
                                </Typography>
                                <Typography variant="h5" component="div" color="error.main">
                                    {stats.failed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom variant="body2">
                                    Đã hoàn tiền
                                </Typography>
                                <Typography variant="h5" component="div" color="info.main">
                                    {stats.refunded}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                            <CardContent>
                                <Typography color="white" gutterBottom variant="body2">
                                    Tổng doanh thu
                                </Typography>
                                <Typography variant="h5" component="div" color="white">
                                    {formatCurrency(stats.totalAmount)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filter Box */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
                            <TextField
                                placeholder="Tìm kiếm theo mã, khách hàng, phim..."
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ maxWidth: 400 }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Bộ lọc
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchPayments}
                            >
                                Làm mới
                            </Button>
                        </Box>
                    </Box>

                    {showFilters && (
                        <Box mt={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Trạng thái</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={handleStatusFilterChange}
                                            label="Trạng thái"
                                        >
                                            <MenuItem value="all">Tất cả trạng thái</MenuItem>
                                            <MenuItem value="completed">Đã thanh toán</MenuItem>
                                            <MenuItem value="pending">Đang xử lý</MenuItem>
                                            <MenuItem value="failed">Thất bại</MenuItem>
                                            <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Phương thức</InputLabel>
                                        <Select
                                            value={paymentMethodFilter}
                                            onChange={handlePaymentMethodFilterChange}
                                            label="Phương thức"
                                        >
                                            <MenuItem value="all">Tất cả phương thức</MenuItem>
                                            <MenuItem value="credit_card">Thẻ tín dụng</MenuItem>
                                            <MenuItem value="debit_card">Thẻ ghi nợ</MenuItem>
                                            <MenuItem value="cash">Tiền mặt</MenuItem>
                                            <MenuItem value="momo">Ví MoMo</MenuItem>
                                            <MenuItem value="zalopay">ZaloPay</MenuItem>
                                            <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                        <DatePicker
                                            label="Từ ngày"
                                            value={fromDate}
                                            onChange={handleFromDateChange}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                        <DatePicker
                                            label="Đến ngày"
                                            value={toDate}
                                            onChange={handleToDateChange}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button variant="text" onClick={handleClearFilters}>
                                    Xóa bộ lọc
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Payments Table */}
                {loading && !openDetailsDialog ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            Đang tải danh sách thanh toán...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 3 }}>
                        {error}
                    </Alert>
                ) : filteredPayments.length === 0 ? (
                    <Alert severity="info" sx={{ my: 3 }}>
                        Không tìm thấy thanh toán nào
                    </Alert>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã thanh toán</TableCell>
                                    <TableCell>Khách hàng</TableCell>
                                    <TableCell>Thông tin</TableCell>
                                    <TableCell>Phương thức</TableCell>
                                    <TableCell>Số tiền</TableCell>
                                    <TableCell>Ngày thanh toán</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayments
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((payment) => (
                                        <TableRow hover key={payment._id}>
                                            <TableCell>
                                                {payment._id.substring(payment._id.length - 6).toUpperCase()}
                                            </TableCell>
                                            <TableCell>
                                                {payment.user?.name || 'N/A'}
                                                <br />
                                                <Typography variant="caption" color="textSecondary">
                                                    {payment.user?.email || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {payment.showtime?.movie?.title || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatDateTime(payment.showtime?.date)} | {payment.showtime?.startTime || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getPaymentMethodText(payment.paymentMethod)}</TableCell>
                                            <TableCell>{formatCurrency(payment.totalAmount)}</TableCell>
                                            <TableCell>{formatDateTime(payment.paymentDate)}</TableCell>
                                            <TableCell>{getStatusChip(payment.status)}</TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="Xem chi tiết">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleOpenDetailsDialog(payment)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Cập nhật trạng thái">
                                                        <IconButton
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => handleOpenStatusDialog(payment)}
                                                        >
                                                            <ReceiptIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Gửi email">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => handleSendEmail(payment)}
                                                        >
                                                            <EmailIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="In biên lai">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePrintReceipt(payment)}
                                                        >
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredPayments.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số hàng mỗi trang:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                        />
                    </TableContainer>
                )}
            </Box>

            {/* Payment Details Dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={handleCloseDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Chi tiết thanh toán</Typography>
                        {selectedPayment && getStatusChip(selectedPayment.status)}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingDetail ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : selectedPayment ? (
                        <Grid container spacing={3}>
                            {/* Left Column */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Thông tin thanh toán
                                </Typography>
                                <List dense disablePadding>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Mã thanh toán:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">{selectedPayment._id}</Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Mã giao dịch:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.transactionId || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Thời gian:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {formatDateTime(selectedPayment.paymentDate)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Phương thức:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {getPaymentMethodText(selectedPayment.paymentMethod)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Tổng thanh toán:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {formatCurrency(selectedPayment.totalAmount)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                </List>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Thông tin khách hàng
                                </Typography>
                                <List dense disablePadding>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Họ tên:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.user?.name || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Email:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.user?.email || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Điện thoại:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.user?.phone || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                </List>
                            </Grid>

                            {/* Right Column */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Thông tin đặt vé
                                </Typography>
                                <List dense disablePadding>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Phim:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.showtime?.movie?.title || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Rạp:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.showtime?.room?.theater?.name || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Phòng:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.showtime?.room?.name || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Ngày chiếu:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {formatDateTime(selectedPayment.showtime?.date).split(' ')[0]}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Giờ chiếu:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.showtime?.startTime || 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Ghế:
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body2">
                                                    {selectedPayment.seats ?
                                                        selectedPayment.seats.map(seat =>
                                                            seat.seatNumber || `${seat.row}${seat.column}`
                                                        ).join(', ') : 'N/A'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                </List>

                                {selectedPayment.status === 'refunded' && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" color="info.main" gutterBottom>
                                            Thông tin hoàn tiền
                                        </Typography>
                                        <List dense disablePadding>
                                            <ListItem disableGutters>
                                                <Grid container>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Ngày hoàn tiền:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={7}>
                                                        <Typography variant="body2">
                                                            {formatDateTime(selectedPayment.refundDate)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </ListItem>
                                            <ListItem disableGutters>
                                                <Grid container>
                                                    <Grid item xs={5}>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Lý do hoàn tiền:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={7}>
                                                        <Typography variant="body2">
                                                            {selectedPayment.refundReason || 'Không có lý do'}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </ListItem>
                                        </List>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography>Không có thông tin thanh toán</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog}>Đóng</Button>
                    {selectedPayment && (
                        <>
                            <Button
                                color="primary"
                                startIcon={<EmailIcon />}
                                onClick={() => handleSendEmail(selectedPayment)}
                            >
                                Gửi email
                            </Button>
                            <Button
                                color="primary"
                                startIcon={<PrintIcon />}
                                onClick={() => handlePrintReceipt(selectedPayment)}
                            >
                                In biên lai
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => {
                                    handleCloseDetailsDialog();
                                    handleOpenStatusDialog(selectedPayment);
                                }}
                            >
                                Cập nhật trạng thái
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog
                open={openStatusDialog}
                onClose={handleCloseStatusDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
                <DialogContent dividers>
                    {selectedPayment && (
                        <Box>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="completed">Đã thanh toán</MenuItem>
                                    <MenuItem value="pending">Đang xử lý</MenuItem>
                                    <MenuItem value="failed">Thất bại</MenuItem>
                                    <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
                                </Select>
                            </FormControl>

                            {newStatus === 'refunded' && (
                                <TextField
                                    label="Lý do hoàn tiền"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Nhập lý do hoàn tiền"
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog}>Hủy</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || updatingStatus}
                    >
                        {updatingStatus ? <CircularProgress size={24} /> : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default PaymentManagement; 