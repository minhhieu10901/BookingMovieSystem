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
    Avatar,
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
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAllMovies, deleteMovie } from '../../../api-helpers/api-helpers';
import AdminLayout from '../AdminLayout';

const MovieManagement = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch movies
    const fetchMovies = async () => {
        setLoading(true);
        try {
            const data = await getAllMovies();
            if (data && data.movies) {
                setMovies(data.movies);
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách phim',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // Handle movie deletion
    const handleDeleteClick = (movie) => {
        setSelectedMovie(movie);
        setOpenDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMovie) return;

        try {
            const result = await deleteMovie(selectedMovie._id);

            // Cập nhật danh sách phim sau khi xóa thành công
            setMovies(prevMovies => prevMovies.filter(movie => movie._id !== selectedMovie._id));

            // Hiển thị thông báo thành công
            setSnackbar({
                open: true,
                message: 'Xóa phim thành công',
                severity: 'success'
            });

            // Đóng dialog xác nhận
            setOpenDialog(false);
            setSelectedMovie(null);

            // Làm mới dữ liệu từ server để đảm bảo đồng bộ
            setTimeout(() => {
                fetchMovies();
            }, 1000);

        } catch (error) {
            console.error("Error deleting movie:", error);

            // Hiển thị thông báo lỗi chi tiết
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Không thể xóa phim. Vui lòng thử lại sau.',
                severity: 'error'
            });

            // Đóng dialog xác nhận
            setOpenDialog(false);
            setSelectedMovie(null);
        }
    };

    // Filtering and searching
    const filteredMovies = movies
        .filter(movie => {
            if (filterStatus === 'all') return true;
            if (filterStatus === 'featured') return movie.featured;
            if (filterStatus === 'regular') return !movie.featured;
            return true;
        })
        .filter(movie => {
            const searchTermLower = searchTerm.toLowerCase();

            // Kiểm tra tiêu đề phim
            const titleMatch = movie.title?.toLowerCase().includes(searchTermLower) || false;

            // Kiểm tra thể loại (có thể là string hoặc array)
            let genreMatch = false;
            if (movie.genre) {
                if (Array.isArray(movie.genre)) {
                    // Nếu genre là một mảng
                    genreMatch = movie.genre.some(g =>
                        g && typeof g === 'string' && g.toLowerCase().includes(searchTermLower)
                    );
                } else if (typeof movie.genre === 'string') {
                    // Nếu genre là một chuỗi
                    genreMatch = movie.genre.toLowerCase().includes(searchTermLower);
                }
            }

            // Kiểm tra đạo diễn
            const directorMatch = movie.director?.toLowerCase().includes(searchTermLower) || false;

            return titleMatch || genreMatch || directorMatch;
        });

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Snackbar close handler
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const movieManagementContent = (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" fontWeight="bold" color="#2d2b42">
                    Quản lý phim
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/add"
                    sx={{
                        bgcolor: '#2d2b42',
                        '&:hover': { bgcolor: '#1a1830' }
                    }}
                >
                    Thêm phim mới
                </Button>
            </Box>

            {/* Filter and Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm theo tên, thể loại, đạo diễn..."
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
                                <MenuItem value="featured">Phim đặc sắc</MenuItem>
                                <MenuItem value="regular">Phim thường</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchMovies}
                            sx={{ borderRadius: 2 }}
                        >
                            Làm mới
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Movies Table */}
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
                                <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 'bold' }}>Tên phim</TableCell>
                                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Thể loại</TableCell>
                                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Đạo diễn</TableCell>
                                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell width="15%" align="center" sx={{ fontWeight: 'bold' }}>Ngày phát hành</TableCell>
                                <TableCell width="15%" align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={40} />
                                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                            Đang tải danh sách phim...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredMovies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Typography variant="body1">
                                            Không tìm thấy phim nào.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMovies
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((movie, index) => (
                                        <TableRow
                                            key={movie._id}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="center">
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Avatar
                                                    variant="rounded"
                                                    src={movie.posterUrl}
                                                    alt={movie.title}
                                                    sx={{
                                                        width: 60,
                                                        height: 80,
                                                        borderRadius: 1,
                                                        border: '1px solid #eee'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                                    {movie.title}
                                                </Typography>
                                                {movie.duration && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {movie.duration} phút
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {movie.genre || "--"}
                                            </TableCell>
                                            <TableCell>
                                                {movie.director || "--"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    icon={movie.featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                    label={movie.featured ? "Đặc sắc" : "Thường"}
                                                    color={movie.featured ? "success" : "default"}
                                                    variant={movie.featured ? "filled" : "outlined"}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : "--"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Sửa phim">
                                                    <IconButton
                                                        component={Link}
                                                        to={`/edit-movie/${movie._id}`}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa phim">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteClick(movie)}
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
                    count={filteredMovies.length}
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
                    Xác nhận xóa phim
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa phim "{selectedMovie?.title}"?
                        Hành động này không thể hoàn tác.
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
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );

    return <AdminLayout>{movieManagementContent}</AdminLayout>;
};

export default MovieManagement; 