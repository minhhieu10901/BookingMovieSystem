import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tooltip,
    Grid,
    CircularProgress,
    Divider,
    Snackbar,
    Alert,
    TablePagination
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    LocationCity as LocationCityIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAllCinemas, deleteCinema } from '../../../api-helpers/api-helpers';
import AdminLayout from '../AdminLayout';

const CinemaManagement = () => {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCinema, setSelectedCinema] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch cinemas
    const fetchCinemas = async () => {
        setLoading(true);
        try {
            const data = await getAllCinemas();
            if (data && data.cinemas) {
                setCinemas(data.cinemas);
            }
        } catch (error) {
            console.error("Error fetching cinemas:", error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách rạp chiếu',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    // Handle cinema deletion
    const handleDeleteClick = (cinema) => {
        setSelectedCinema(cinema);
        setOpenDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCinema) return;

        try {
            await deleteCinema(selectedCinema._id);

            // Update cinema list after deletion
            setCinemas(prevCinemas => prevCinemas.filter(cinema => cinema._id !== selectedCinema._id));

            setSnackbar({
                open: true,
                message: 'Xóa rạp chiếu thành công',
                severity: 'success'
            });
        } catch (error) {
            console.error("Error deleting cinema:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Đã xảy ra lỗi khi xóa rạp chiếu',
                severity: 'error'
            });
        } finally {
            setOpenDialog(false);
        }
    };

    // Search and filter
    const filteredCinemas = cinemas.filter(cinema => {
        // Search by name, address, city, phone, or email
        const matchesSearch = (
            cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cinema.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cinema.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cinema.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cinema.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Filter by status
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && cinema.status === 'active') ||
            (filterStatus === 'inactive' && cinema.status === 'inactive');

        return matchesSearch && matchesStatus;
    });

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    const cinemaManagementContent = (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Quản lý rạp chiếu
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/add-cinema"
                    color="primary"
                >
                    Thêm rạp chiếu mới
                </Button>
            </Box>

            {/* Filter and Search */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm theo tên, địa chỉ, thành phố..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                                sx: { borderRadius: 2 }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Trạng thái"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="active">Đang hoạt động</MenuItem>
                                <MenuItem value="inactive">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchCinemas}
                            sx={{ borderRadius: 2 }}
                        >
                            Làm mới
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Cinemas Table */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                }}
            >
                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell width="5%" align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 'bold' }}>Tên rạp</TableCell>
                                <TableCell width="25%" sx={{ fontWeight: 'bold' }}>Địa chỉ</TableCell>
                                <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Thành phố</TableCell>
                                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Điện thoại</TableCell>
                                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell width="15%" align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={40} />
                                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                            Đang tải danh sách rạp chiếu...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCinemas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography variant="body1">
                                            Không tìm thấy rạp chiếu nào.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCinemas
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((cinema, index) => (
                                        <TableRow
                                            key={cinema._id}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="center">
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                                    {cinema.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {cinema.address}
                                            </TableCell>
                                            <TableCell>
                                                {cinema.city}
                                            </TableCell>
                                            <TableCell>
                                                {cinema.phone}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    icon={cinema.status === 'active' ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                                                    label={cinema.status === 'active' ? "Hoạt động" : "Không hoạt động"}
                                                    color={cinema.status === 'active' ? "success" : "default"}
                                                    variant={cinema.status === 'active' ? "filled" : "outlined"}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Sửa rạp chiếu">
                                                    <IconButton
                                                        component={Link}
                                                        to={`/edit-cinema/${cinema._id}`}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa rạp chiếu">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(cinema)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCinemas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
                    }
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>
                    Xác nhận xóa rạp chiếu
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa rạp chiếu "{selectedCinema?.name}"?
                        Hành động này sẽ xóa tất cả phòng chiếu liên quan và không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        variant="outlined"
                        startIcon={<CloseIcon />}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );

    return <AdminLayout>{cinemaManagementContent}</AdminLayout>;
};

export default CinemaManagement; 