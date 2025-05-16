import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Grid,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    EventSeat as SeatIcon,
    LocalActivity as TicketIcon,
    Settings as SettingsIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getRoomById,
    getSeatsByRoom,
    addSeats,
    updateSeat,
    updateMultipleSeats,
    deleteSeats
} from '../../../api-helpers/api-helpers';
import AdminLayout from '../AdminLayout';

// Define seat types and their colors
const SEAT_TYPES = [
    { value: 'standard', label: 'Tiêu chuẩn', color: '#4caf50' },
    { value: 'vip', label: 'VIP', color: '#9c27b0' },
    { value: 'couple', label: 'Ghế đôi', color: '#e91e63' }
];

// Define seat statuses and their colors
const SEAT_STATUSES = [
    { value: 'available', label: 'Có sẵn', color: '#4caf50' },
    { value: 'maintenance', label: 'Bảo trì', color: '#ff9800' },
    { value: 'reserved', label: 'Đã đặt', color: '#2196f3' },
    { value: 'booked', label: 'Đã bán', color: '#f44336' }
];

const SeatManagement = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newSeatDialogOpen, setNewSeatDialogOpen] = useState(false);
    const [setupDialogOpen, setSetupDialogOpen] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Setup form state
    const [setupForm, setSetupForm] = useState({
        rowStart: 'A',
        rowEnd: 'I',
        columnsPerRow: 9,
        seatType: 'standard'
    });

    // For editing a seat
    const [editForm, setEditForm] = useState({
        type: 'standard',
        status: 'available'
    });

    // Fetch room and seats data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const roomData = await getRoomById(roomId);

                if (!roomData || !roomData.room) {
                    throw new Error('Không thể tải thông tin phòng chiếu');
                }

                setRoom(roomData.room);

                const seatsData = await getSeatsByRoom(roomId);
                if (seatsData && seatsData.seats) {
                    setSeats(seatsData.seats);

                    // Extract unique rows and columns
                    const uniqueRows = [...new Set(seatsData.seats.map(seat => seat.row))].sort();
                    const uniqueColumns = [...new Set(seatsData.seats.map(seat => seat.column))].sort((a, b) => a - b);

                    setRows(uniqueRows);
                    setColumns(uniqueColumns);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId]);

    // Calculate seat type or status color
    const getSeatColor = (seat) => {
        if (seat) {
            // For status-based coloring
            const statusColor = SEAT_STATUSES.find(s => s.value === seat.status)?.color;

            // For type-based coloring (can be used as background with status as border)
            const typeColor = SEAT_TYPES.find(t => t.value === seat.type)?.color;

            return {
                backgroundColor: typeColor || '#4caf50',
                borderColor: statusColor || '#4caf50'
            };
        }
        return { backgroundColor: '#e0e0e0', borderColor: '#9e9e9e' };
    };

    // Find a seat by row and column
    const getSeatByPosition = (row, col) => {
        return seats.find(seat => seat.row === row && seat.column === col);
    };

    // Handle seat click
    const handleSeatClick = (seat) => {
        if (seat) {
            setSelectedSeat(seat);
            setEditForm({
                type: seat.type,
                status: seat.status
            });
            setEditDialogOpen(true);
        }
    };

    // Handle edit form change
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle seat edit save
    const handleEditSave = async () => {
        try {
            if (!selectedSeat) return;

            await updateSeat(selectedSeat._id, editForm);

            // Update the seat in the local state
            setSeats(prev =>
                prev.map(seat =>
                    seat._id === selectedSeat._id
                        ? { ...seat, ...editForm }
                        : seat
                )
            );

            setSnackbar({
                open: true,
                message: 'Cập nhật ghế thành công',
                severity: 'success'
            });

            setEditDialogOpen(false);
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Cập nhật ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Handle setup form change
    const handleSetupFormChange = (e) => {
        const { name, value } = e.target;
        setSetupForm(prev => ({ ...prev, [name]: value }));
    };

    // Generate seats based on setup form
    const handleSetupSave = async () => {
        try {
            const { rowStart, rowEnd, columnsPerRow, seatType } = setupForm;

            // Check if seats already exist
            if (seats.length > 0) {
                // Ask confirmation before deleting existing seats
                if (window.confirm('Phòng này đã có ghế. Bạn có muốn xóa tất cả ghế hiện tại và tạo mới không?')) {
                    await deleteSeats(roomId);
                } else {
                    setSetupDialogOpen(false);
                    return;
                }
            }

            const startCharCode = rowStart.charCodeAt(0);
            const endCharCode = rowEnd.charCodeAt(0);

            if (startCharCode > endCharCode) {
                throw new Error('Hàng bắt đầu phải trước hàng kết thúc trong bảng chữ cái');
            }

            const newSeats = [];
            for (let r = startCharCode; r <= endCharCode; r++) {
                const row = String.fromCharCode(r);
                for (let col = 1; col <= columnsPerRow; col++) {
                    newSeats.push({
                        row,
                        column: col,
                        seatNumber: `${row}${col}`,
                        type: seatType,
                        status: 'available'
                    });
                }
            }

            const result = await addSeats({
                room: roomId,
                seats: newSeats
            });

            if (result && result.success) {
                // Refresh the page to show the new seats
                window.location.reload();
            } else {
                throw new Error('Không thể tạo ghế');
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Tạo ghế thất bại',
                severity: 'error'
            });
            setSetupDialogOpen(false);
        }
    };

    // Handle delete seats
    const handleDeleteSeats = async () => {
        try {
            await deleteSeats(roomId);

            setSnackbar({
                open: true,
                message: 'Xóa tất cả ghế thành công',
                severity: 'success'
            });

            setSeats([]);
            setRows([]);
            setColumns([]);
            setDeleteDialogOpen(false);
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Xóa ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Handle update all seats of a specific type
    const updateAllSeatsOfType = async (oldType, newType) => {
        try {
            const seatsToUpdate = seats
                .filter(seat => seat.type === oldType)
                .map(seat => ({
                    _id: seat._id,
                    type: newType
                }));

            if (seatsToUpdate.length === 0) return;

            await updateMultipleSeats(roomId, seatsToUpdate);

            // Update local state
            setSeats(prev =>
                prev.map(seat =>
                    seat.type === oldType
                        ? { ...seat, type: newType }
                        : seat
                )
            );

            setSnackbar({
                open: true,
                message: `Cập nhật tất cả ghế loại ${oldType} thành công`,
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Cập nhật ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Đang tải dữ liệu...
                    </Typography>
                </Box>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                        <Typography variant="h6">Lỗi</Typography>
                        <Typography>{error}</Typography>
                        <Box mt={2}>
                            <Button variant="outlined" onClick={() => navigate('/rooms-management')}>
                                Quay lại danh sách phòng chiếu
                            </Button>
                        </Box>
                    </Alert>
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box mb={4}>
                <Box display="flex" alignItems="center" mb={3} justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <IconButton
                            color="primary"
                            onClick={() => navigate('/rooms-management')}
                            sx={{ mr: 1 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                            Quản lý ghế ngồi - {room?.name || ''}
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={() => setSetupDialogOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            Thiết lập ghế
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={seats.length === 0}
                        >
                            Xóa tất cả ghế
                        </Button>
                    </Box>
                </Box>

                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <SeatIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="medium" color="primary.main">
                            Thông tin phòng
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">Tên phòng:</Typography>
                            <Typography variant="body1" fontWeight="medium">{room?.name || 'N/A'}</Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">Rạp chiếu:</Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {room?.cinema?.name || (typeof room?.cinema === 'string' ? 'ID: ' + room.cinema : 'N/A')}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">Loại phòng:</Typography>
                            <Typography variant="body1" fontWeight="medium">{room?.type || 'N/A'}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Seat type legend */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <TicketIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="medium" color="primary.main">
                            Loại ghế
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    <Box display="flex" flexWrap="wrap" gap={2}>
                        {SEAT_TYPES.map(type => (
                            <Chip
                                key={type.value}
                                label={type.label}
                                sx={{
                                    bgcolor: type.color,
                                    color: 'white',
                                    fontWeight: 'medium'
                                }}
                            />
                        ))}
                    </Box>
                </Paper>

                {/* Seat layout */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <SeatIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="medium" color="primary.main">
                            Sơ đồ ghế ngồi
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    {seats.length === 0 ? (
                        <Box textAlign="center" py={5}>
                            <Typography variant="body1" mb={3}>
                                Phòng chiếu này chưa có ghế ngồi
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setSetupDialogOpen(true)}
                            >
                                Thiết lập ghế ngồi
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {/* Screen */}
                            <Box
                                mb={5}
                                sx={{
                                    height: '25px',
                                    bgcolor: '#e0e0e0',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    width: '80%',
                                    mx: 'auto'
                                }}
                            >
                                <Typography color="text.secondary" lineHeight="25px" fontWeight="medium">
                                    Màn hình
                                </Typography>
                            </Box>

                            {/* Seat rows */}
                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                {rows.map(row => (
                                    <Box key={row} display="flex" alignItems="center">
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            sx={{ width: '30px', textAlign: 'center' }}
                                        >
                                            {row}
                                        </Typography>

                                        <Box display="flex" gap={1}>
                                            {columns.map(col => {
                                                const seat = getSeatByPosition(row, col);
                                                const seatColors = getSeatColor(seat);

                                                return (
                                                    <Tooltip
                                                        key={`${row}${col}`}
                                                        title={seat ? `${seat.seatNumber} - ${SEAT_TYPES.find(t => t.value === seat.type)?.label || 'Standard'} (${SEAT_STATUSES.find(s => s.value === seat.status)?.label || 'Available'})` : 'No seat'}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: '40px',
                                                                height: '40px',
                                                                backgroundColor: seatColors.backgroundColor,
                                                                border: `2px solid ${seatColors.borderColor}`,
                                                                borderRadius: '6px 6px 12px 12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff',
                                                                fontWeight: 'bold',
                                                                cursor: seat ? 'pointer' : 'default',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                '&:hover': {
                                                                    boxShadow: seat ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                                                                    transform: seat ? 'translateY(-2px)' : 'none'
                                                                },
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                            onClick={() => seat && handleSeatClick(seat)}
                                                        >
                                                            {col}
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>

                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            sx={{ width: '30px', textAlign: 'center' }}
                                        >
                                            {row}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Edit seat dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Chỉnh sửa ghế {selectedSeat?.seatNumber}</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: '300px', pt: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Loại ghế</InputLabel>
                            <Select
                                name="type"
                                value={editForm.type}
                                onChange={handleEditFormChange}
                                label="Loại ghế"
                            >
                                {SEAT_TYPES.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                name="status"
                                value={editForm.status}
                                onChange={handleEditFormChange}
                                label="Trạng thái"
                            >
                                {SEAT_STATUSES.map(status => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleEditSave}
                    >
                        Lưu thay đổi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Setup seats dialog */}
            <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)}>
                <DialogTitle>Thiết lập ghế ngồi</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Thiết lập sơ đồ ghế ngồi cho phòng chiếu. Hãy nhập hàng bắt đầu (ví dụ: A) và hàng kết thúc (ví dụ: I), cùng với số ghế mỗi hàng.
                    </DialogContentText>

                    <Box sx={{ minWidth: '300px' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Hàng bắt đầu"
                                    name="rowStart"
                                    value={setupForm.rowStart}
                                    onChange={handleSetupFormChange}
                                    fullWidth
                                    inputProps={{ maxLength: 1 }}
                                    helperText="Chữ cái in hoa (A-Z)"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    label="Hàng kết thúc"
                                    name="rowEnd"
                                    value={setupForm.rowEnd}
                                    onChange={handleSetupFormChange}
                                    fullWidth
                                    inputProps={{ maxLength: 1 }}
                                    helperText="Chữ cái in hoa (A-Z)"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Số ghế mỗi hàng"
                                    name="columnsPerRow"
                                    type="number"
                                    value={setupForm.columnsPerRow}
                                    onChange={handleSetupFormChange}
                                    fullWidth
                                    inputProps={{ min: 1, max: 20 }}
                                    helperText="Số lượng từ 1-20"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Loại ghế mặc định</InputLabel>
                                    <Select
                                        name="seatType"
                                        value={setupForm.seatType}
                                        onChange={handleSetupFormChange}
                                        label="Loại ghế mặc định"
                                    >
                                        {SEAT_TYPES.map(type => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSetupDialogOpen(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={handleSetupSave}
                    >
                        Tạo ghế
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete seats confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa tất cả ghế trong phòng này? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteSeats}
                    >
                        Xóa tất cả ghế
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar notifications */}
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
        </AdminLayout>
    );
};

export default SeatManagement; 