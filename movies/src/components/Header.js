import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Movie as MovieIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminActions, userActions } from '../store';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        if (isAdminLoggedIn) {
            dispatch(adminActions.logout());
            localStorage.removeItem("adminId");
        } else {
            dispatch(userActions.logout());
            localStorage.removeItem("userId");
        }
        navigate("/");
        handleCloseUserMenu();
    };

    const getNavItems = () => {
        if (isAdminLoggedIn) {
            return [
                { label: 'Movies', path: '/movies' },
                { label: 'Add Movie', path: '/add' },
                { label: 'Profile', path: '/user-admin' },
            ];
        } else if (isUserLoggedIn) {
            return [
                { label: 'Movies', path: '/movies' },
                { label: 'Profile', path: '/user' },
            ];
        } else {
            return [
                { label: 'Movies', path: '/movies' },
                { label: 'Auth', path: '/auth' },
                { label: 'Admin', path: '/admin' },
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <AppBar
            position="sticky"
            sx={{
                bgcolor: 'primary.main',
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'primary.dark',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: '64px',
                        justifyContent: 'space-between'
                    }}
                >
                    {/* Logo - Mobile */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <MovieIcon sx={{ mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.2rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            MOVIES
                        </Typography>
                    </Box>

                    {/* Logo - Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <MovieIcon sx={{ mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.2rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            MOVIES
                        </Typography>
                    </Box>

                    {/* Navigation - Mobile */}
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                        }}
                    >
                        {navItems.map((item) => (
                            <MenuItem
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    handleCloseNavMenu();
                                }}
                            >
                                <Typography textAlign="center">{item.label}</Typography>
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Navigation - Desktop */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        gap: 2,
                        ml: 4,
                        flex: 1
                    }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    handleCloseNavMenu();
                                }}
                                sx={{
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {/* User Menu */}
                    {(isUserLoggedIn || isAdminLoggedIn) && (
                        <Box sx={{ flexShrink: 0 }}>
                            <Tooltip title="Account settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'primary.dark',
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem onClick={handleLogout}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;