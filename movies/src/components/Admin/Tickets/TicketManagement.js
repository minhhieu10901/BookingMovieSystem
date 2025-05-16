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
    InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import AdminLayout from '../AdminLayout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
    getAllTickets,
    getTicketById,
    addTicket,
    updateTicket,
    deleteTicket,
    getAllShowtimes,
    getUserById
} from '../../../api-helpers/api-helpers';
import { format } from 'date-fns';

const TicketManagement = () => {
    // State cho danh sách loại vé
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // State cho tìm kiếm và lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State cho dialog thêm/sửa vé
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' hoặc 'edit'
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'standard',
        price: '',
        discount: 0,
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // State cho dialog xóa vé
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // State cho thông báo
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // State cho dữ liệu phụ trợ
    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(false);

    // Fetch danh sách loại vé
    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllTickets();

            if (data && data.tickets) {
                setTickets(data.tickets);
                setFilteredTickets(data.tickets);
            } else {
                setTickets([]);
                setFilteredTickets([]);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setError(error.message || 'Không thể tải danh sách loại vé');
        } finally {
            setLoading(false);
        }
    };

    // Fetch danh sách suất chiếu cho form thêm/sửa vé
    const fetchShowtimes = async () => {
        try {
            setLoadingShowtimes(true);
            const data = await getAllShowtimes();

            if (data && data.showtimes) {
                setShowtimes(data.showtimes);
            } else {
                setShowtimes([]);
            }
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            showSnackbar('Không thể tải danh sách suất chiếu', 'error');
        } finally {
            setLoadingShowtimes(false);
        }
    };

    // Fetch chi tiết loại vé để sửa
    const fetchTicketDetails = async (ticketId) => {
        try {
            setLoading(true);
            const data = await getTicketById(ticketId);

            if (data && data.ticket) {
                setSelectedTicket(data.ticket);
                setFormData({
                    name: data.ticket.name,
                    type: data.ticket.type,
                    price: data.ticket.price,
                    discount: data.ticket.discount,
                    status: data.ticket.status
                });
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            showSnackbar('Không thể tải thông tin loại vé', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Effect hooks
    useEffect(() => {
        fetchTickets();
    }, []);

    // Effect cho bộ lọc
    useEffect(() => {
        if (tickets.length === 0) return;

        let result = [...tickets];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(ticket =>
                ticket.name?.toLowerCase().includes(searchLower) ||
                ticket.type?.toLowerCase().includes(searchLower)
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== 'all') {
            result = result.filter(ticket => ticket.status === statusFilter);
        }

        setFilteredTickets(result);
        setPage(0); // Reset về trang đầu tiên khi filter thay đổi
    }, [tickets, searchTerm, statusFilter]);

    // Handlers
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenAddDialog = () => {
        setDialogMode('add');
        setSelectedTicket(null);
        setFormData({
            name: '',
            type: 'standard',
            price: '',
            discount: 0,
            status: 'active'
        });
        setFormErrors({});
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (ticket) => {
        setDialogMode('edit');
        fetchTicketDetails(ticket._id);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormErrors({});
    };

    const handleOpenDeleteDialog = (ticket) => {
        setTicketToDelete(ticket);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setTicketToDelete(null);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Vui lòng nhập tên loại vé';
        if (!formData.type) errors.type = 'Vui lòng chọn loại vé';
        if (!formData.price) errors.price = 'Vui lòng nhập giá vé';
        else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            errors.price = 'Giá vé phải là số dương';
        }
        if (formData.discount && (isNaN(formData.discount) || Number(formData.discount) < 0 || Number(formData.discount) > 100)) {
            errors.discount = 'Giảm giá phải là số từ 0 đến 100';
        }
        if (!formData.status) errors.status = 'Vui lòng chọn trạng thái';

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

            const ticketData = {
                ...formData,
                price: Number(formData.price),
                discount: Number(formData.discount || 0)
            };

            let response;
            if (dialogMode === 'add') {
                response = await addTicket(ticketData);
            } else {
                response = await updateTicket(selectedTicket._id, ticketData);
            }

            if (response.success) {
                showSnackbar(
                    dialogMode === 'add'
                        ? 'Thêm loại vé thành công'
                        : 'Cập nhật loại vé thành công'
                );
                handleCloseDialog();
                fetchTickets(); // Refresh danh sách
            } else {
                showSnackbar(
                    response.message ||
                    (dialogMode === 'add'
                        ? 'Thêm loại vé thất bại'
                        : 'Cập nhật loại vé thất bại'),
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar(
                error.message ||
                (dialogMode === 'add'
                    ? 'Thêm loại vé thất bại'
                    : 'Cập nhật loại vé thất bại'),
                'error'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!ticketToDelete) return;

        try {
            setDeleting(true);
            const response = await deleteTicket(ticketToDelete._id);

            if (response.success) {
                showSnackbar('Xóa loại vé thành công');
                handleCloseDeleteDialog();
                fetchTickets(); // Refresh danh sách
            } else {
                showSnackbar(response.message || 'Xóa loại vé thất bại', 'error');
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            showSnackbar(error.message || 'Xóa loại vé thất bại', 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Hiển thị trạng thái loại vé
    const getStatusChip = (status) => {
        switch (status) {
            case 'active':
                return <Chip label="Đang hoạt động" color="success" size="small" />;
            case 'inactive':
                return <Chip label="Ngừng hoạt động" color="error" size="small" />;
            default:
                return <Chip label={status} color="primary" size="small" />;
        }
    };

    // Format tiền tệ VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format loại vé
    const formatTicketType = (type) => {
        switch (type) {
            case 'standard':
                return 'Thường';
            case 'vip':
                return 'VIP';
            case 'couple':
                return 'Ghế đôi';
            case 'student':
                return 'Học sinh/Sinh viên';
            default:
                return type;
        }
    };

    const content = (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Quản lý loại vé
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                    >
                        Thêm loại vé mới
                    </Button>
                </Box>

                {/* Filter Box */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tìm kiếm"
                                variant="outlined"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Tìm theo tên, loại vé..."
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                                    <MenuItem value="active">Đang hoạt động</MenuItem>
                                    <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tickets Table */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>
                            Đang tải danh sách loại vé...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 3 }}>
                        {error}
                    </Alert>
                ) : filteredTickets.length === 0 ? (
                    <Alert severity="info" sx={{ my: 3 }}>
                        Không tìm thấy loại vé nào
                    </Alert>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên loại vé</TableCell>
                                    <TableCell>Loại</TableCell>
                                    <TableCell>Giá vé</TableCell>
                                    <TableCell>Giảm giá (%)</TableCell>
                                    <TableCell>Giá sau giảm</TableCell>
                                    <TableCell>Trạng thái</TableCell>
                                    <TableCell>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTickets
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((ticket) => (
                                        <TableRow key={ticket._id}>
                                            <TableCell>{ticket.name}</TableCell>
                                            <TableCell>{formatTicketType(ticket.type)}</TableCell>
                                            <TableCell>{formatCurrency(ticket.price)}</TableCell>
                                            <TableCell>{ticket.discount}%</TableCell>
                                            <TableCell>
                                                {formatCurrency(ticket.price * (1 - ticket.discount / 100))}
                                            </TableCell>
                                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenEditDialog(ticket)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenDeleteDialog(ticket)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredTickets.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số hàng mỗi trang:"
                        />
                    </TableContainer>
                )}
            </Box>

            {/* Dialog thêm/sửa loại vé */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogMode === 'add' ? 'Thêm loại vé mới' : 'Sửa thông tin loại vé'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="name"
                                label="Tên loại vé"
                                value={formData.name}
                                onChange={handleFormChange}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.type}>
                                <InputLabel>Loại vé</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    label="Loại vé"
                                >
                                    <MenuItem value="standard">Thường</MenuItem>
                                    <MenuItem value="vip">VIP</MenuItem>
                                    <MenuItem value="couple">Ghế đôi</MenuItem>
                                    <MenuItem value="student">Học sinh/Sinh viên</MenuItem>
                                </Select>
                                {formErrors.type && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.type}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                name="price"
                                label="Giá vé"
                                type="number"
                                value={formData.price}
                                onChange={handleFormChange}
                                error={!!formErrors.price}
                                helperText={formErrors.price}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                name="discount"
                                label="Giảm giá (%)"
                                type="number"
                                value={formData.discount}
                                onChange={handleFormChange}
                                error={!!formErrors.discount}
                                helperText={formErrors.discount}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                            />
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
                                    <MenuItem value="active">Đang hoạt động</MenuItem>
                                    <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                                </Select>
                                {formErrors.status && (
                                    <Typography color="error" variant="caption">
                                        {formErrors.status}
                                    </Typography>
                                )}
                            </FormControl>
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
                        {submitting ? 'Đang xử lý...' : dialogMode === 'add' ? 'Thêm loại vé' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa loại vé</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa loại vé này không? Hành động này không thể hoàn tác.
                    </Typography>
                    {ticketToDelete && (
                        <Box mt={2}>
                            <Typography variant="body2">
                                <strong>Tên loại vé:</strong> {ticketToDelete.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Loại:</strong> {formatTicketType(ticketToDelete.type)}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Giá:</strong> {formatCurrency(ticketToDelete.price)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? 'Đang xử lý...' : 'Xóa loại vé'}
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

export default TicketManagement; 