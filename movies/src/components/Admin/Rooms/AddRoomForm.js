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
    Snackbar,
    Divider,
    IconButton,
    Card,
    CardContent,
    Chip,
    FormHelperText,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    MeetingRoom as RoomIcon,
    Theaters as CinemaIcon,
    EventSeat as SeatIcon,
    Settings as SettingsIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { addRoom, getAllCinemas } from '../../../api-helpers/api-helpers';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const roomTypes = [
    'Standard',
    'IMAX',
    '3D',
    '4DX',
    'VIP'
];

const roomFeatures = [
    'Dolby Atmos',
    'Recliner Seats',
    'Premium Sound',
    'Ultra HD',
    'Disabled Access',
    'Bar Service',
    'Food Service'
];

const AddRoomForm = () => {
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        name: "",
        cinema: "",
        type: "Standard",
        features: [],
        status: "active"
    });

    const [cinemas, setCinemas] = useState([]);
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch cinemas
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const data = await getAllCinemas();
                if (data && data.cinemas) {
                    setCinemas(data.cinemas);

                    // Set default cinema if available
                    if (data.cinemas.length > 0) {
                        setInputs(prev => ({
                            ...prev,
                            cinema: data.cinemas[0]._id
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching cinemas:", error);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải danh sách rạp chiếu',
                    severity: 'error'
                });
            }
        };

        fetchCinemas();
    }, []);

    // Validation helpers
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Tên phòng chiếu là bắt buộc';
                else if (value.length > 50) error = 'Tên không được vượt quá 50 ký tự';
                break;

            case 'cinema':
                if (!value) error = 'Rạp chiếu là bắt buộc';
                break;

            case 'type':
                if (!value) error = 'Loại phòng là bắt buộc';
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

    const handleFeaturesChange = (event) => {
        const {
            target: { value },
        } = event;

        // On autofill we get a stringified value.
        const selectedFeatures = typeof value === 'string' ? value.split(',') : value;

        setInputs(prev => ({
            ...prev,
            features: selectedFeatures
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(inputs).forEach(key => {
            if (key !== 'features') { // Features are optional
                const error = validateField(key, inputs[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
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
            const result = await addRoom(inputs);

            if (result && result.success) {
                setSnackbar({
                    open: true,
                    message: result.message || 'Thêm phòng chiếu thành công!',
                    severity: 'success'
                });

                // Redirect to room management after successful submission
                setTimeout(() => {
                    navigate('/rooms-management');
                }, 2000);
            } else {
                throw new Error(result?.message || 'Thêm phòng chiếu thất bại');
            }
        } catch (error) {
            console.error("Error adding room:", error);
            setSnackbar({
                open: true,
                message: error.message || 'Đã xảy ra lỗi khi thêm phòng chiếu',
                severity: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/rooms-management');
    };

    // Section components for better organization
    const RoomDetailsSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <RoomIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Thông tin phòng chiếu
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Tên phòng"
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

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" required error={!!errors.cinema}>
                            <InputLabel>Rạp chiếu</InputLabel>
                            <Select
                                label="Rạp chiếu"
                                name="cinema"
                                value={inputs.cinema}
                                onChange={handleChange}
                            >
                                {cinemas.map((cinema) => (
                                    <MenuItem key={cinema._id} value={cinema._id}>
                                        {cinema.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.cinema && <FormHelperText>{errors.cinema}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" required error={!!errors.type}>
                            <InputLabel>Loại phòng</InputLabel>
                            <Select
                                label="Loại phòng"
                                name="type"
                                value={inputs.type}
                                onChange={handleChange}
                            >
                                {roomTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const FeaturesSection = () => (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <SeatIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.main">
                        Tính năng đặc biệt
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Tính năng</InputLabel>
                            <Select
                                multiple
                                value={inputs.features}
                                onChange={handleFeaturesChange}
                                input={<OutlinedInput label="Tính năng" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {roomFeatures.map((feature) => (
                                    <MenuItem key={feature} value={feature}>
                                        <Checkbox checked={inputs.features.indexOf(feature) > -1} />
                                        <ListItemText primary={feature} />
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Chọn các tính năng đặc biệt của phòng chiếu</FormHelperText>
                        </FormControl>
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
                                <MenuItem value="maintenance">Đang bảo trì</MenuItem>
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
                        Thêm phòng chiếu mới
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <RoomDetailsSection />
                <FeaturesSection />
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
                        startIcon={<AddIcon />}
                    >
                        {submitting ? 'Đang thêm phòng chiếu...' : 'Thêm phòng chiếu'}
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

export default AddRoomForm; 