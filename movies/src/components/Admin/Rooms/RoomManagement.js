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
    TablePagination,
    Card,
    CardContent
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
    MeetingRoom as RoomIcon,
    Theaters as CinemaIcon,
    EventSeat as EventSeatIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAllRooms, getAllCinemas, deleteRoom, getRoomsByCinema } from '../../../api-helpers/api-helpers';
import AdminLayout from '../AdminLayout';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCinema, setSelectedCinema] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch cinemas for dropdown
    const fetchCinemas = async () => {
        try {
            const data = await getAllCinemas();
            if (data && data.cinemas) {
                setCinemas(data.cinemas);

                // Set first cinema as default if available
                if (data.cinemas.length > 0) {
                    setSelectedCinema(data.cinemas[0]._id);
                    fetchRoomsByCinema(data.cinemas[0]._id);
                } else {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Error fetching cinemas:", error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách rạp chiếu',
                severity: 'error'
            });
            setLoading(false);
        }
    };

    // Fetch rooms for selected cinema
    const fetchRoomsByCinema = async (cinemaId) => {
        if (!cinemaId) return;

        setLoading(true);
        try {
            const data = await getRoomsByCinema(cinemaId);
            if (data && data.rooms) {
                setRooms(data.rooms);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách phòng chiếu',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    // Handle cinema selection change
    const handleCinemaChange = (e) => {
        const cinemaId = e.target.value;
        setSelectedCinema(cinemaId);
        fetchRoomsByCinema(cinemaId);
        // Reset pagination
        setPage(0);
    };

    // Handle room deletion
    const handleDeleteClick = (room) => {
        setSelectedRoom(room);
        setOpenDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRoom) return;

        try {
            await deleteRoom(selectedRoom._id);

            // Update room list after deletion
            setRooms(prevRooms => prevRooms.filter(room => room._id !== selectedRoom._id));

            setSnackbar({
                open: true,
                message: 'Xóa phòng chiếu thành công',
                severity: 'success'
            });
        } catch (error) {
            console.error("Error deleting room:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Đã xảy ra lỗi khi xóa phòng chiếu',
                severity: 'error'
            });
        } finally {
            setOpenDialog(false);
        }
    };

    // Search and filter
    const filteredRooms = rooms.filter(room => {
        // Search by name
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by status
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && room.status === 'active') ||
            (filterStatus === 'maintenance' && room.status === 'maintenance') ||
            (filterStatus === 'inactive' && room.status === 'inactive');

        // Filter by type
        const matchesType =
            filterType === 'all' ||
            (room.type === filterType);

        return matchesSearch && matchesStatus && matchesType;
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

    // Get status chip color
    const getStatusChip = (status) => {
        switch (status) {
            case 'active':
                return (
                    <Chip
                        size="small"
                        icon={<CheckIcon fontSize="small" />}
                        label="Hoạt động"
                        color="success"
                        variant="filled"
                    />
                );
            case 'maintenance':
                return (
                    <Chip
                        size="small"
                        label="Bảo trì"
                        color="warning"
                        variant="filled"
                    />
                );
            case 'inactive':
                return (
                    <Chip
                        size="small"
                        icon={<CloseIcon fontSize="small" />}
                        label="Không hoạt động"
                        color="default"
                        variant="outlined"
                    />
                );
            default:
                return (
                    <Chip
                        size="small"
                        label={status}
                        color="default"
                    />
                );
        }
    };

    // Cinema selector card
    const CinemaSelectorCard = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <CinemaIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Chọn rạp chiếu
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <FormControl fullWidth variant="outlined">
                    <InputLabel>Rạp chiếu</InputLabel>
                    <Select
                        value={selectedCinema}
                        onChange={handleCinemaChange}
                        label="Rạp chiếu"
                    >
                        {cinemas.map((cinema) => (
                            <MenuItem key={cinema._id} value={cinema._id}>
                                {cinema.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </CardContent>
        </Card>
    );

    const roomManagementContent = (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Quản lý phòng chiếu
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to={selectedCinema ? `/add-room?cinema=${selectedCinema}` : "/add-room"}
                    color="primary"
                    disabled={!selectedCinema}
                >
                    Thêm phòng chiếu mới
                </Button>
            </Box>

            {/* Cinema Selector */}
            <CinemaSelectorCard />

            {selectedCinema && (
                <>
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
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Tìm kiếm theo tên phòng..."
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
                                        <MenuItem value="maintenance">Đang bảo trì</MenuItem>
                                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Loại phòng</InputLabel>
                                    <Select
                                        value={filterType}
                                        label="Loại phòng"
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        <MenuItem value="Standard">Tiêu chuẩn</MenuItem>
                                        <MenuItem value="IMAX">IMAX</MenuItem>
                                        <MenuItem value="3D">3D</MenuItem>
                                        <MenuItem value="4DX">4DX</MenuItem>
                                        <MenuItem value="VIP">VIP</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    startIcon={<RefreshIcon />}
                                    onClick={() => fetchRoomsByCinema(selectedCinema)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Làm mới
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Rooms Table */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            overflow: 'hidden',
                            borderRadius: 2,
                            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                        }}
                    >
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="5%" align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell width="35%" sx={{ fontWeight: 'bold' }}>Tên phòng</TableCell>
                                        <TableCell width="25%" sx={{ fontWeight: 'bold' }}>Loại phòng</TableCell>
                                        <TableCell width="15%" align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                        <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                                <CircularProgress size={40} />
                                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                                    Đang tải danh sách phòng chiếu...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredRooms.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                                <Typography variant="body1">
                                                    Không tìm thấy phòng chiếu nào.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRooms
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((room, index) => (
                                                <TableRow
                                                    key={room._id}
                                                    hover
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell align="center">
                                                        {page * rowsPerPage + index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                                            {room.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {room.type}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {getStatusChip(room.status)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Sửa phòng chiếu">
                                                            <IconButton
                                                                component={Link}
                                                                to={`/edit-room/${room._id}`}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Quản lý ghế ngồi">
                                                            <IconButton
                                                                component={Link}
                                                                to={`/seat-management/${room._id}`}
                                                                color="secondary"
                                                                size="small"
                                                            >
                                                                <EventSeatIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa phòng chiếu">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleDeleteClick(room)}
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
                            count={filteredRooms.length}
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
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>
                    Xác nhận xóa phòng chiếu
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa phòng chiếu "{selectedRoom?.name}"?
                        Hành động này sẽ xóa tất cả ghế ngồi liên quan và không thể hoàn tác.
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

    return <AdminLayout>{roomManagementContent}</AdminLayout>;
};

export default RoomManagement; 