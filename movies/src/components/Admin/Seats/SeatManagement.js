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
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
    EventSeat as SeatIcon,
    LocalActivity as TicketIcon,
    Settings as SettingsIcon,
    Check as CheckIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    getRoomById,
    getAllCinemas,
    getRoomsByCinema,
    getSeatsByRoom,
    addSeats,
    updateSeat,
    updateMultipleSeats,
    deleteSeats
} from '../../../api-helpers/api-helpers';
import AdminLayout from '../AdminLayout';

// Định nghĩa loại ghế và màu sắc tương ứng
const SEAT_TYPES = [
    { value: 'standard', label: 'Tiêu chuẩn', color: '#4caf50' },
    { value: 'vip', label: 'VIP', color: '#9c27b0' },
    { value: 'couple', label: 'Ghế đôi', color: '#e91e63' }
];

// Định nghĩa trạng thái ghế và màu sắc tương ứng
const SEAT_STATUSES = [
    { value: 'available', label: 'Có sẵn', color: '#4caf50' },
    { value: 'maintenance', label: 'Bảo trì', color: '#ff9800' },
    { value: 'reserved', label: 'Đã đặt', color: '#2196f3' },
    { value: 'booked', label: 'Đã bán', color: '#f44336' }
];

const SeatManagement = () => {
    const navigate = useNavigate();

    // State cho việc lựa chọn rạp và phòng
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedCinemaId, setSelectedCinemaId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [loadingCinemas, setLoadingCinemas] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // State cho thông tin ghế và phòng
    const [room, setRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho dialog và thông báo
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [setupDialogOpen, setSetupDialogOpen] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // State cho form thiết lập ghế
    const [setupForm, setSetupForm] = useState({
        rowStart: 'A',
        rowEnd: 'I',
        columnsPerRow: 9,
        seatType: 'standard'
    });

    // State cho form chỉnh sửa ghế
    const [editForm, setEditForm] = useState({
        type: 'standard',
        status: 'available'
    });

    // Fetch danh sách rạp chiếu khi component được mount
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                setLoadingCinemas(true);
                const data = await getAllCinemas();
                if (data && data.cinemas) {
                    setCinemas(data.cinemas);

                    // Nếu có rạp, tự động chọn rạp đầu tiên
                    if (data.cinemas.length > 0) {
                        setSelectedCinemaId(data.cinemas[0]._id);
                    }
                }
            } catch (err) {
                console.error("Error fetching cinemas:", err);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải danh sách rạp chiếu',
                    severity: 'error'
                });
            } finally {
                setLoadingCinemas(false);
            }
        };

        fetchCinemas();
    }, []);

    // Fetch danh sách phòng chiếu khi chọn rạp
    useEffect(() => {
        const fetchRooms = async () => {
            if (!selectedCinemaId) return;

            try {
                setLoadingRooms(true);
                setRooms([]);
                setSelectedRoomId('');

                const data = await getRoomsByCinema(selectedCinemaId);
                if (data && data.rooms) {
                    setRooms(data.rooms);
                }
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải danh sách phòng chiếu',
                    severity: 'error'
                });
            } finally {
                setLoadingRooms(false);
            }
        };

        fetchRooms();
    }, [selectedCinemaId]);

    // Fetch thông tin phòng và ghế khi chọn phòng
    useEffect(() => {
        const fetchRoomAndSeats = async () => {
            if (!selectedRoomId) {
                setRoom(null);
                setSeats([]);
                setRows([]);
                setColumns([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch thông tin phòng
                const roomData = await getRoomById(selectedRoomId);
                if (!roomData || !roomData.room) {
                    throw new Error('Không thể tải thông tin phòng chiếu');
                }

                setRoom(roomData.room);

                // Fetch danh sách ghế
                const seatsData = await getSeatsByRoom(selectedRoomId);
                if (seatsData && seatsData.seats) {
                    setSeats(seatsData.seats);

                    // Tìm các hàng và cột duy nhất
                    const uniqueRows = [...new Set(seatsData.seats.map(seat => seat.row))].sort();
                    const uniqueColumns = [...new Set(seatsData.seats.map(seat => seat.column))].sort((a, b) => a - b);

                    setRows(uniqueRows);
                    setColumns(uniqueColumns);
                } else {
                    setSeats([]);
                    setRows([]);
                    setColumns([]);
                }
            } catch (err) {
                console.error("Error fetching room and seats:", err);
                setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomAndSeats();
    }, [selectedRoomId]);

    // Tính toán màu sắc cho ghế
    const getSeatColor = (seat) => {
        if (seat) {
            // Màu theo trạng thái
            const statusColor = SEAT_STATUSES.find(s => s.value === seat.status)?.color;

            // Màu theo loại
            const typeColor = SEAT_TYPES.find(t => t.value === seat.type)?.color;

            return {
                backgroundColor: typeColor || '#4caf50',
                borderColor: statusColor || '#4caf50'
            };
        }
        return { backgroundColor: '#e0e0e0', borderColor: '#9e9e9e' };
    };

    // Tìm ghế theo hàng và cột
    const getSeatByPosition = (row, col) => {
        return seats.find(seat => seat.row === row && seat.column === col);
    };

    // Xử lý khi click vào ghế
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

    // Xử lý thay đổi trong form chỉnh sửa
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý lưu chỉnh sửa ghế
    const handleEditSave = async () => {
        try {
            if (!selectedSeat) return;

            await updateSeat(selectedSeat._id, editForm);

            // Cập nhật ghế trong state
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
            console.error("Error updating seat:", err);
            setSnackbar({
                open: true,
                message: err.message || 'Cập nhật ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Xử lý thay đổi trong form thiết lập
    const handleSetupFormChange = (e) => {
        const { name, value } = e.target;
        setSetupForm(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý lưu thiết lập ghế
    const handleSetupSave = async () => {
        if (!selectedRoomId) {
            setSnackbar({
                open: true,
                message: 'Vui lòng chọn phòng chiếu trước',
                severity: 'error'
            });
            return;
        }

        try {
            const { rowStart, rowEnd, columnsPerRow, seatType } = setupForm;

            // Kiểm tra nếu đã có ghế
            if (seats.length > 0) {
                // Hỏi xác nhận trước khi xóa
                if (window.confirm('Phòng này đã có ghế. Bạn có muốn xóa tất cả ghế hiện tại và tạo mới không?')) {
                    await deleteSeats(selectedRoomId);
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
                        room: selectedRoomId,
                        row,
                        column: col,
                        seatNumber: `${row}${col}`,
                        type: seatType,
                        status: 'available'
                    });
                }
            }

            const result = await addSeats({
                room: selectedRoomId,
                seats: newSeats
            });

            if (result && result.success) {
                setSnackbar({
                    open: true,
                    message: 'Tạo ghế thành công',
                    severity: 'success'
                });

                // Fetch lại danh sách ghế
                const seatsData = await getSeatsByRoom(selectedRoomId);
                if (seatsData && seatsData.seats) {
                    setSeats(seatsData.seats);

                    const uniqueRows = [...new Set(seatsData.seats.map(seat => seat.row))].sort();
                    const uniqueColumns = [...new Set(seatsData.seats.map(seat => seat.column))].sort((a, b) => a - b);

                    setRows(uniqueRows);
                    setColumns(uniqueColumns);
                }
            } else {
                throw new Error('Không thể tạo ghế');
            }

            setSetupDialogOpen(false);
        } catch (err) {
            console.error("Error creating seats:", err);
            setSnackbar({
                open: true,
                message: err.message || 'Tạo ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Xử lý xóa tất cả ghế
    const handleDeleteSeats = async () => {
        if (!selectedRoomId) return;

        try {
            await deleteSeats(selectedRoomId);

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
            console.error("Error deleting seats:", err);
            setSnackbar({
                open: true,
                message: err.message || 'Xóa ghế thất bại',
                severity: 'error'
            });
        }
    };

    // Xử lý đóng snackbar
    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false
        });
    };

    // Xử lý chọn rạp chiếu
    const handleCinemaChange = (e) => {
        setSelectedCinemaId(e.target.value);
    };

    // Xử lý chọn phòng chiếu
    const handleRoomChange = (e) => {
        setSelectedRoomId(e.target.value);
    };

    // UI khi đang tải
    if (loadingCinemas) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Đang tải danh sách rạp chiếu...
                    </Typography>
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box mb={4}>
                <Typography variant="h5" fontWeight="bold" color="primary.main" mb={3}>
                    Quản lý ghế ngồi
                </Typography>

                {/* Chọn rạp và phòng */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Rạp chiếu</InputLabel>
                                <Select
                                    value={selectedCinemaId}
                                    onChange={handleCinemaChange}
                                    label="Rạp chiếu"
                                    disabled={loadingCinemas}
                                >
                                    {cinemas.map((cinema) => (
                                        <MenuItem key={cinema._id} value={cinema._id}>
                                            {cinema.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Phòng chiếu</InputLabel>
                                <Select
                                    value={selectedRoomId}
                                    onChange={handleRoomChange}
                                    label="Phòng chiếu"
                                    disabled={loadingRooms || !selectedCinemaId || rooms.length === 0}
                                >
                                    {loadingRooms ? (
                                        <MenuItem value="">
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Đang tải...
                                        </MenuItem>
                                    ) : rooms.length === 0 ? (
                                        <MenuItem value="">
                                            Không có phòng chiếu
                                        </MenuItem>
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
                    </Grid>
                </Paper>

                {selectedRoomId && (
                    <>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                                <CircularProgress />
                                <Typography variant="body1" sx={{ ml: 2 }}>
                                    Đang tải thông tin ghế ngồi...
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ my: 3 }}>
                                {error}
                            </Alert>
                        ) : (
                            <>
                                {/* Thông tin phòng và nút hành động */}
                                <Box display="flex" alignItems="center" mb={3} justifyContent="space-between">
                                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                                        Phòng: {room?.name || ''}
                                    </Typography>

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

                                {/* Loại ghế */}
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

                                {/* Sơ đồ ghế ngồi */}
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
                                            {/* Màn hình */}
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

                                            {/* Hàng ghế */}
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
                                                                        title={seat ? `${seat.seatNumber} - ${SEAT_TYPES.find(t => t.value === seat.type)?.label || 'Tiêu chuẩn'} (${SEAT_STATUSES.find(s => s.value === seat.status)?.label || 'Có sẵn'})` : 'Không có ghế'}
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
                            </>
                        )}
                    </>
                )}
            </Box>

            {/* Dialog chỉnh sửa ghế */}
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

            {/* Dialog thiết lập ghế */}
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

            {/* Dialog xác nhận xóa */}
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

            {/* Snackbar thông báo */}
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