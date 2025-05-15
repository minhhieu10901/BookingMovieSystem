import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Divider,
    Button,
    Avatar,
    Container,
    IconButton,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Movie as MovieIcon,
    People as PeopleIcon,
    EventSeat as EventSeatIcon,
    ConfirmationNumber as TicketIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    ArrowUpward as ArrowUpIcon,
    Theaters as TheatersIcon,
    Chair as ChairIcon,
    MeetingRoom as RoomIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    ShoppingCart as CartIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    ArrowBack as ArrowBackIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getAllMovies, getAdminById } from '../../../api-helpers/api-helpers';
import { useDispatch } from 'react-redux';
import { adminActions } from '../../../store';
import AdminLayout from '../AdminLayout';

const DRAWER_WIDTH = 240;

const Dashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeItem, setActiveItem] = useState('dashboard');
    const [stats, setStats] = useState({
        totalMovies: 0,
        featuredMovies: 0,
        totalBookings: 0,
        totalTickets: 0,
        totalPayments: 0,
        recentMovies: []
    });

    const [adminData, setAdminData] = useState(null);

    // Đăng xuất
    const handleLogout = () => {
        dispatch(adminActions.logout());
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminToken");
        navigate("/");
    };

    // Quay lại trang chủ
    const handleBackToHome = () => {
        navigate("/");
    };

    useEffect(() => {
        // Lấy thông tin admin
        getAdminById()
            .then((res) => {
                setAdminData(res.admin);
                if (res.admin?.addedMovies) {
                    setStats(prev => ({
                        ...prev,
                        totalMovies: res.admin.addedMovies.length
                    }));
                }
            })
            .catch((err) => console.log(err));

        // Lấy danh sách phim
        getAllMovies()
            .then((res) => {
                if (res.movies) {
                    const featuredCount = res.movies.filter(movie => movie.featured).length;
                    const recentMovies = [...res.movies].sort((a, b) =>
                        new Date(b.releaseDate) - new Date(a.releaseDate)
                    ).slice(0, 5);

                    setStats(prev => ({
                        ...prev,
                        featuredMovies: featuredCount,
                        recentMovies: recentMovies
                    }));
                }
            })
            .catch((err) => console.log(err));
    }, []);

    // Sidebar menu items
    const menuItems = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard'
        },
        {
            id: 'movies',
            title: 'Quản lý phim',
            icon: <MovieIcon />,
            path: '/movies-management'
        },
        {
            id: 'cinemas',
            title: 'Quản lý rạp chiếu',
            icon: <TheatersIcon />,
            path: '/cinemas-management'
        },
        {
            id: 'showtimes',
            title: 'Quản lý suất chiếu',
            icon: <ScheduleIcon />,
            path: '/showtimes-management'
        },
        {
            id: 'rooms',
            title: 'Quản lý phòng chiếu',
            icon: <RoomIcon />,
            path: '/rooms-management'
        },
        {
            id: 'seats',
            title: 'Quản lý ghế ngồi',
            icon: <ChairIcon />,
            path: '/seats-management'
        },
        {
            id: 'tickets',
            title: 'Quản lý vé',
            icon: <TicketIcon />,
            path: '/tickets-management'
        },
        {
            id: 'bookings',
            title: 'Quản lý đặt vé',
            icon: <CartIcon />,
            path: '/bookings-management'
        },
        {
            id: 'payments',
            title: 'Quản lý thanh toán',
            icon: <PaymentIcon />,
            path: '/payments-management'
        },
        {
            id: 'accounts',
            title: 'Quản lý tài khoản',
            icon: <PersonIcon />,
            path: '/accounts-management'
        }
    ];

    // Dashboard content
    const dashboardContent = (
        <>
            {/* Welcome Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#2d2b42" gutterBottom>
                    Chào mừng trở lại, {adminData?.name || 'Admin'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Đây là tổng quan về thông tin và hoạt động của hệ thống.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Movies */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: '#f0f8ff',
                            border: '1px solid #e3f2fd'
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Tổng số phim
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                            {stats.totalMovies}
                        </Typography>
                        <Button
                            size="small"
                            component={Link}
                            to="/movies-management"
                            sx={{ textTransform: 'none' }}
                        >
                            Xem danh sách phim
                        </Button>
                    </Paper>
                </Grid>

                {/* Featured Movies */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: '#fff8f0',
                            border: '1px solid #ffecb3'
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Phim đặc sắc
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                            {stats.featuredMovies}
                        </Typography>
                        <Button
                            size="small"
                            component={Link}
                            to="/movies-management"
                            sx={{ textTransform: 'none' }}
                        >
                            Xem chi tiết
                        </Button>
                    </Paper>
                </Grid>

                {/* Total Bookings */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: '#f0fff4',
                            border: '1px solid #e6ffed'
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Tổng số đặt vé
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                            {stats.totalBookings || '0'}
                        </Typography>
                        <Button
                            size="small"
                            component={Link}
                            to="/bookings-management"
                            sx={{ textTransform: 'none' }}
                        >
                            Xem đặt vé
                        </Button>
                    </Paper>
                </Grid>

                {/* Total Tickets */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: '#fff0f6',
                            border: '1px solid #ffe3ec'
                        }}
                    >
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Tổng số vé đã bán
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                            {stats.totalTickets || '0'}
                        </Typography>
                        <Button
                            size="small"
                            component={Link}
                            to="/tickets-management"
                            sx={{ textTransform: 'none' }}
                        >
                            Xem chi tiết
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Movies Section */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" color="#2d2b42">
                        Phim mới nhất
                    </Typography>
                    <Button
                        component={Link}
                        to="/movies-management"
                        size="small"
                        endIcon={<ArrowUpIcon fontSize="small" />}
                    >
                        Xem tất cả
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {stats.recentMovies.length > 0 ? (
                        stats.recentMovies.map((movie) => (
                            <Grid item xs={12} sm={6} md={4} lg={2.4} key={movie._id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid #eaeaea',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: 200,
                                            position: 'relative',
                                            bgcolor: '#f5f5f5'
                                        }}
                                    >
                                        <Avatar
                                            variant="square"
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: 0
                                            }}
                                        />
                                        {movie.featured && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: 'success.main',
                                                    color: 'white',
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    py: 0.5,
                                                    px: 1,
                                                    borderRadius: 1
                                                }}
                                            >
                                                Đặc sắc
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom noWrap>
                                            {movie.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {movie.genre || 'Không có thể loại'}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            {movie.releaseDate
                                                ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                                                : 'Không có ngày phát hành'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="body1" color="text.secondary">
                                    Chưa có phim nào. Thêm phim mới ngay!
                                </Typography>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/add"
                                    startIcon={<AddIcon />}
                                    sx={{
                                        mt: 2,
                                        bgcolor: '#2d2b42',
                                        '&:hover': { bgcolor: '#1a1830' }
                                    }}
                                >
                                    Thêm phim mới
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Quick Access */}
            <Box>
                <Typography variant="h5" fontWeight="bold" color="#2d2b42" gutterBottom>
                    Truy cập nhanh
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #eaeaea',
                                '&:hover': { boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Button
                                fullWidth
                                component={Link}
                                to="/add"
                                variant="contained"
                                startIcon={<AddIcon />}
                                size="large"
                                sx={{
                                    p: 1.5,
                                    bgcolor: '#2d2b42',
                                    '&:hover': { bgcolor: '#1a1830' }
                                }}
                            >
                                Thêm phim mới
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #eaeaea',
                                '&:hover': { boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Button
                                fullWidth
                                component={Link}
                                to="/showtimes-management"
                                variant="outlined"
                                size="large"
                                sx={{ p: 1.5 }}
                            >
                                Quản lý lịch chiếu
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid #eaeaea',
                                '&:hover': { boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }
                            }}
                        >
                            <Button
                                fullWidth
                                component={Link}
                                to="/bookings-management"
                                variant="outlined"
                                size="large"
                                sx={{ p: 1.5 }}
                            >
                                Xem đặt vé mới nhất
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );

    return <AdminLayout>{dashboardContent}</AdminLayout>;
};

export default Dashboard; 