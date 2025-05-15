import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Divider,
    Avatar,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Movie as MovieIcon,
    Theaters as TheatersIcon,
    Chair as ChairIcon,
    MeetingRoom as RoomIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    ShoppingCart as CartIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    ArrowBack as ArrowBackIcon,
    ConfirmationNumber as TicketIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminById } from '../../api-helpers/api-helpers';
import { useDispatch } from 'react-redux';
import { adminActions } from '../../store';

const DRAWER_WIDTH = 240;

const AdminLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [adminData, setAdminData] = useState(null);
    const [activeItem, setActiveItem] = useState('');

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
        // Xác định menu item active dựa vào đường dẫn hiện tại
        const currentPath = location.pathname;
        const currentItem = menuItems.find(item => item.path === currentPath);
        if (currentItem) {
            setActiveItem(currentItem.id);
        }

        // Lấy thông tin admin
        getAdminById()
            .then((res) => {
                setAdminData(res.admin);
            })
            .catch((err) => console.log(err));
    }, [location.pathname]);

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

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <Box
                component="aside"
                sx={{
                    width: { xs: isMobile ? 0 : '100%', md: DRAWER_WIDTH },
                    flexShrink: 0,
                    bgcolor: '#2d2b42',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'fixed',
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    zIndex: 1200,
                    transition: 'width 0.3s ease',
                    overflowY: 'auto'
                }}
            >
                {/* Header Sidebar */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <Avatar
                        src={adminData?.profilePic || ''}
                        alt="Admin"
                        sx={{ width: 80, height: 80, mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight="medium">
                        {adminData?.name || 'Admin'}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Quản trị viên
                    </Typography>
                </Box>

                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* Menu Items */}
                <List component="nav" sx={{ p: 1 }}>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.id}
                            selected={activeItem === item.id}
                            onClick={() => {
                                setActiveItem(item.id);
                                navigate(item.path);
                            }}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.title} />
                        </ListItemButton>
                    ))}
                </List>

                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <ListItemButton
                        onClick={handleBackToHome}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                            <ArrowBackIcon />
                        </ListItemIcon>
                        <ListItemText primary="Về trang chủ" />
                    </ListItemButton>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Đăng xuất" />
                    </ListItemButton>
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
                    overflow: 'auto',
                    backgroundColor: '#f5f6fa',
                    minHeight: '100vh'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout; 