import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Alert,
    AlertTitle,
    Snackbar,
    Divider,
    IconButton,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationCity as LocationCityIcon,
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Settings as SettingsIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { getCinemaById, updateCinema } from '../../../api-helpers/api-helpers';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

const EditCinemaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);

    const [inputs, setInputs] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        status: "active"
    });

    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCinemaDetails = async () => {
            try {
                setLoading(true);
                const cinemaData = await getCinemaById(id);

                if (cinemaData && cinemaData.cinema) {
                    const cinema = cinemaData.cinema;

                    setInputs({
                        name: cinema.name || "",
                        address: cinema.address || "",
                        city: cinema.city || "",
                        phone: cinema.phone || "",
                        email: cinema.email || "",
                        status: cinema.status || "active"
                    });

                } else {
                    throw new Error("Không thể tải thông tin rạp chiếu");
                }
            } catch (error) {
                console.error("Error fetching cinema:", error);
                setLoadingError(error.message || "Đã xảy ra lỗi khi tải thông tin rạp chiếu");
            } finally {
                setLoading(false);
            }
        };

        fetchCinemaDetails();
    }, [id]);

    const cityOptions = [
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ',
        'Biên Hòa',
        'Nha Trang',
        'Huế',
        'Đà Lạt',
        'Vũng Tàu',
        'Quy Nhơn',
        'Hạ Long',
        'Phan Thiết',
        'Buôn Ma Thuột',
        'Khác'
    ];

    // Validation helpers
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Tên rạp chiếu là bắt buộc';
                else if (value.length > 100) error = 'Tên không được vượt quá 100 ký tự';
                break;

            case 'address':
                if (!value.trim()) error = 'Địa chỉ là bắt buộc';
                break;

            case 'city':
                if (!value.trim()) error = 'Thành phố là bắt buộc';
                break;

            case 'phone':
                if (!value.trim()) error = 'Số điện thoại là bắt buộc';
                else if (!/^[0-9+\- ]{10,15}$/.test(value))
                    error = 'Số điện thoại không hợp lệ';
                break;

            case 'email':
                if (!value.trim()) error = 'Email là bắt buộc';
                else if (!/\S+@\S+\.\S+/.test(value))
                    error = 'Email không hợp lệ';
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update the input state without triggering validation on every keystroke
        setInputs(prev => ({ ...prev, [name]: value }));

        // Only validate after a short delay to avoid focus loss
        // This ensures validation runs after typing stops, not during typing
        const error = validateField(name, value);
        if (error !== errors[name]) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(inputs).forEach(key => {
            const error = validateField(key, inputs[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                severity: 'error'
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await updateCinema(id, inputs);
            console.log("API response:", result);

            if (result && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Cập nhật rạp chiếu thành công!',
                    severity: 'success'
                });

                // Redirect to cinema management after successful submission
                setTimeout(() => {
                    navigate('/cinemas-management');
                }, 2000);
            } else {
                throw new Error(result?.message || 'Cập nhật rạp chiếu thất bại');
            }
        } catch (error) {
            console.error("Error updating cinema:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Đã xảy ra lỗi khi cập nhật rạp chiếu',
                severity: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/cinemas-management');
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Đang tải thông tin rạp chiếu...
                    </Typography>
                </Box>
            </AdminLayout>
        );
    }

    if (loadingError) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                        <AlertTitle>Lỗi</AlertTitle>
                        {loadingError}
                        <Box mt={2}>
                            <Button variant="outlined" onClick={() => navigate('/cinemas-management')}>
                                Quay lại danh sách rạp chiếu
                            </Button>
                        </Box>
                    </Alert>
                </Box>
            </AdminLayout>
        );
    }

    // Section components for better organization
    const CinemaDetailsSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <BusinessIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Thông tin rạp chiếu
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tên rạp chiếu"
                            name="name"
                            value={inputs.name}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Địa chỉ"
                            name="address"
                            value={inputs.address}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.address}
                            helperText={errors.address}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" required error={!!errors.city}>
                            <InputLabel>Thành phố</InputLabel>
                            <Select
                                label="Thành phố"
                                name="city"
                                value={inputs.city}
                                onChange={handleChange}
                            >
                                {cityOptions.map((city) => (
                                    <MenuItem key={city} value={city}>
                                        {city}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.city && <Typography color="error" variant="caption">{errors.city}</Typography>}
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const ContactSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Thông tin liên hệ
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Số điện thoại"
                            name="phone"
                            value={inputs.phone}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={inputs.email}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            required
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const StatusSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <SettingsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Trạng thái
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                label="Trạng thái"
                                name="status"
                                value={inputs.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="active">Đang hoạt động</MenuItem>
                                <MenuItem value="inactive">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const formContent = (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton
                        onClick={handleCancel}
                        sx={{ mr: 2 }}
                        color="primary"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                        Chỉnh sửa rạp chiếu
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <CinemaDetailsSection />
                <ContactSection />
                <StatusSection />

                <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={submitting}
                        size="large"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        size="large"
                        startIcon={<SaveIcon />}
                    >
                        {submitting ? 'Đang cập nhật...' : 'Cập nhật rạp chiếu'}
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );

    return <AdminLayout>{formContent}</AdminLayout>;
};

export default EditCinemaForm; 