import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    getMovieDetails,
    getSeatsByRoom,
    newBooking,
    getRoomById,
    getShowtimeById,
    getSeatsForShowtime,
    createBooking,
    getTicketPrices,
    completePayment
} from '../../api-helpers/api-helpers';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Container,
    Card,
    CardMedia,
    CardContent,
    Stepper,
    Step,
    StepLabel,
    FormControl,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WeekendIcon from '@mui/icons-material/Weekend';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useSelector } from 'react-redux';

// Constants for seat types and their colors
const SEAT_TYPES = [
    { value: 'standard', label: 'Ghế thường', color: '#4caf50', price: 70000 },
    { value: 'vip', label: 'Ghế VIP', color: '#ff9800', price: 90000 },
    { value: 'couple', label: 'Ghế đôi', color: '#e91e63', price: 150000 },
];

// Constants for seat statuses and their colors
const SEAT_STATUSES = [
    { value: 'available', label: 'Có sẵn', color: 'primary' },
    { value: 'sold', label: 'Đã bán', color: 'error' },
    { value: 'booked', label: 'Đã đặt', color: 'info' },
    { value: 'selected', label: 'Đang chọn', color: 'warning' }
];

// Payment methods
const PAYMENT_METHODS = [
    { value: 'credit_card', label: 'Thẻ tín dụng', icon: <CreditCardIcon /> },
    { value: 'debit_card', label: 'Thẻ ghi nợ', icon: <CreditCardIcon /> },
    { value: 'momo', label: 'Ví MoMo', icon: <PaymentIcon /> },
    { value: 'zalopay', label: 'ZaloPay', icon: <PaymentIcon /> },
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: <PaymentIcon /> },
    { value: 'cash', label: 'Tiền mặt', icon: <PaymentIcon /> },
];

const steps = ['Chọn ghế', 'Chọn phương thức thanh toán', 'Xác nhận thanh toán', 'Hoàn tất'];

const Booking = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [showtime, setShowtime] = useState(null);
    const [movie, setMovie] = useState(null);
    const [room, setRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ticketPrices, setTicketPrices] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { id: showtimeId } = useParams();
    const navigate = useNavigate();

    // Kiểm tra đăng nhập ngay khi component được mount
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setError("Vui lòng đăng nhập để đặt vé");
            setIsAuthenticated(false);
            // Chuyển hướng đến trang đăng nhập sau 2 giây
            const timer = setTimeout(() => {
                navigate('/auth', { state: { returnUrl: `/booking/${showtimeId}` } });
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setIsAuthenticated(true);
        }
    }, [showtimeId, navigate]);

    // Helper function to handle API errors gracefully
    const handleApiError = (err, defaultMessage) => {
        console.error(err);

        // Extract meaningful error message if available
        let errorMessage = defaultMessage;
        if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.message) {
            errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
    };

    // Fetch showtime details, movie info, and room details
    useEffect(() => {
        // Nếu chưa đăng nhập, không cần tải dữ liệu
        if (!isAuthenticated) return;

        const fetchShowtimeDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch showtime data using the new API function
                let showtimeData;
                try {
                    showtimeData = await getShowtimeById(showtimeId);
                    if (!showtimeData || !showtimeData.showtime) {
                        throw new Error("Không thể tải thông tin suất chiếu");
                    }
                } catch (err) {
                    return handleApiError(err, "Không thể tải thông tin suất chiếu. Vui lòng thử lại sau.");
                }

                const showtime = showtimeData.showtime;
                setShowtime(showtime);

                // Fetch movie details
                // Fix: Extract the movie ID correctly based on different possible formats
                const movieId = typeof showtime.movie === 'object'
                    ? showtime.movie._id || showtime.movie.id
                    : showtime.movie;

                console.log("Movie ID extracted:", movieId);

                try {
                    const movieData = await getMovieDetails(movieId);
                    if (!movieData || !movieData.movie) {
                        throw new Error("Không thể tải thông tin phim");
                    }
                    setMovie(movieData.movie);
                } catch (err) {
                    return handleApiError(err, "Không thể tải thông tin phim. Vui lòng thử lại sau.");
                }

                // Fetch room details
                // Fix: Extract the room ID correctly based on different possible formats
                const roomId = typeof showtime.room === 'object'
                    ? showtime.room._id || showtime.room.id
                    : showtime.room;

                console.log("Room ID extracted:", roomId);

                try {
                    const roomData = await getRoomById(roomId);
                    if (!roomData || !roomData.room) {
                        throw new Error("Không thể tải thông tin phòng chiếu");
                    }
                    setRoom(roomData.room);
                } catch (err) {
                    return handleApiError(err, "Không thể tải thông tin phòng chiếu. Vui lòng thử lại sau.");
                }

                // Try to get seats for this showtime (now getSeatsForShowtime will work properly)
                try {
                    const seatsData = await getSeatsForShowtime(showtimeId);
                    if (seatsData && seatsData.seats && seatsData.seats.length > 0) {
                        setSeats(seatsData.seats);

                        // Find unique rows and columns
                        const uniqueRows = [...new Set(seatsData.seats.map(seat => seat.row))].sort();
                        const uniqueColumns = [...new Set(seatsData.seats.map(seat => seat.column))].sort((a, b) => a - b);

                        setRows(uniqueRows);
                        setColumns(uniqueColumns);
                    } else {
                        throw new Error("Không tìm thấy thông tin ghế cho phòng chiếu này");
                    }
                } catch (seatErr) {
                    console.log("Falling back to direct room seats:", seatErr);

                    // Fallback to direct room seat lookup if needed
                    try {
                        const fallbackSeatsData = await getSeatsByRoom(roomId);
                        if (fallbackSeatsData && fallbackSeatsData.seats && fallbackSeatsData.seats.length > 0) {
                            setSeats(fallbackSeatsData.seats);

                            // Find unique rows and columns
                            const uniqueRows = [...new Set(fallbackSeatsData.seats.map(seat => seat.row))].sort();
                            const uniqueColumns = [...new Set(fallbackSeatsData.seats.map(seat => seat.column))].sort((a, b) => a - b);

                            setRows(uniqueRows);
                            setColumns(uniqueColumns);
                        } else {
                            throw new Error("Không tìm thấy thông tin ghế cho phòng chiếu này");
                        }
                    } catch (roomSeatErr) {
                        return handleApiError(roomSeatErr, "Không thể tải thông tin ghế ngồi. Vui lòng thử lại sau.");
                    }
                }

                // Fetch ticket prices
                try {
                    const ticketData = await getTicketPrices();
                    if (ticketData && ticketData.tickets) {
                        setTicketPrices(ticketData.tickets);
                    }
                } catch (err) {
                    console.error("Error fetching ticket prices:", err);
                    // Don't stop the entire process for ticket prices
                }

                setLoading(false);
            } catch (err) {
                handleApiError(err, "Không thể tải thông tin. Vui lòng thử lại sau.");
            }
        };

        fetchShowtimeDetails();
    }, [showtimeId, isAuthenticated]);

    // Handle seat selection
    const handleSeatClick = (seat) => {
        if (!seat || seat.status === 'sold') return;

        setSelectedSeats(prev => {
            if (prev.some(s => s._id === seat._id)) {
                return prev.filter(s => s._id !== seat._id);
            } else {
                return [...prev, seat];
            }
        });
    };

    // Calculate seat color based on type, status, and selection
    const getSeatColor = (seat) => {
        if (!seat) return { backgroundColor: '#e0e0e0', color: '#000' };

        const status = getSeatStatus(seat);
        const type = seat.type || 'standard';

        const typeInfo = SEAT_TYPES.find(t => t.value === type) || SEAT_TYPES[0];
        const statusInfo = SEAT_STATUSES.find(s => s.value === status) || SEAT_STATUSES[0];

        if (status === 'sold' || status === 'booked') {
            return {
                backgroundColor: '#f44336',
                color: '#fff',
                cursor: 'not-allowed'
            };
        }

        if (status === 'selected') {
            return {
                backgroundColor: '#ff9800',
                color: '#fff',
                boxShadow: '0 0 0 2px #fff, 0 0 0 4px #ff9800'
            };
        }

        return {
            backgroundColor: typeInfo.color,
            color: '#fff'
        };
    };

    // Find seat by row and column
    const getSeatByPosition = (row, col) => {
        return seats.find(seat => seat.row === row && seat.column === col);
    };

    // Handle next step
    const handleNext = () => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!isAuthenticated) {
            setError("Vui lòng đăng nhập để đặt vé");
            navigate('/auth', { state: { returnUrl: `/booking/${showtimeId}` } });
            return;
        }

        if (activeStep === 0 && selectedSeats.length === 0) {
            setError("Vui lòng chọn ít nhất một ghế.");
            return;
        }

        // If we are on confirmation step, proceed with payment
        if (activeStep === 2) {
            handleBookingSubmit();
            return;
        }

        // If we are at the final step, don't do anything
        if (activeStep === steps.length - 1) {
            return;
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Handle payment method change
    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    // Handle booking submission
    const handleBookingSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Kiểm tra đăng nhập
            const userId = localStorage.getItem("userId");
            console.log("User ID from localStorage:", userId);
            if (!userId) {
                setError("Vui lòng đăng nhập để đặt vé");
                setLoading(false);
                navigate('/auth', { state: { returnUrl: `/booking/${showtimeId}` } });
                return;
            }

            // Get ticket type for selected seats
            const seatTickets = selectedSeats.map(seat => ({
                seatId: seat._id,
                type: seat.type || 'standard'
            }));

            // Group by ticket type
            const ticketGroups = seatTickets.reduce((acc, curr) => {
                if (!acc[curr.type]) {
                    acc[curr.type] = { type: curr.type, seats: [] };
                }
                acc[curr.type].seats.push(curr.seatId);
                return acc;
            }, {});

            // Find ticket prices
            const ticketsWithPrices = Object.values(ticketGroups).map(group => {
                const ticketType = group.type;
                const ticket = ticketPrices.find(t => t.type === ticketType) ||
                    SEAT_TYPES.find(t => t.value === ticketType);
                return {
                    ticket: ticket?._id || null,
                    type: ticketType,
                    quantity: group.seats.length,
                    price: ticket?.price || (SEAT_TYPES.find(t => t.value === ticketType)?.price || 70000)
                };
            });

            // Calculate total price
            const totalAmount = ticketsWithPrices.reduce(
                (total, item) => total + (item.price * item.quantity),
                0
            );

            // Create booking data
            const bookingData = {
                showtime: showtimeId,
                movie: movie._id,
                seats: selectedSeats.map(seat => seat._id),
                tickets: ticketsWithPrices.map(t => ({
                    ticket: t.ticket,
                    quantity: t.quantity
                })).filter(t => t.ticket), // Only include tickets with valid IDs
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                date: showtime?.date ? new Date(showtime.date) : new Date(),
                user: userId // Thêm userId vào dữ liệu một cách rõ ràng
            };

            console.log("BOOKING DATA [RAW]:", bookingData);
            console.log("BOOKING DATA [JSON]:", JSON.stringify(bookingData));
            console.log("Selected seats:", selectedSeats.length, selectedSeats);
            console.log("Showtime ID:", showtimeId);
            console.log("Movie ID:", movie._id);
            console.log("User ID:", userId);

            // Submit booking using the API function
            let bookingResult;
            try {
                console.log("Calling createBooking API...");
                bookingResult = await createBooking(bookingData);
                console.log("Booking API response:", bookingResult);

                if (!bookingResult || !bookingResult.booking) {
                    throw new Error(bookingResult?.message || "Đặt vé thất bại. Không nhận được thông tin booking.");
                }

                console.log("Booking created successfully:", bookingResult.booking._id);
            } catch (bookingErr) {
                console.error("Lỗi tạo booking [DETAIL]:", bookingErr);
                throw bookingErr;
            }

            // Gọi API để cập nhật trạng thái thanh toán thành 'completed'
            if (bookingResult.payment && bookingResult.payment._id) {
                try {
                    console.log("Bắt đầu cập nhật trạng thái thanh toán:", bookingResult.payment._id);
                    const paymentResult = await completePayment(bookingResult.payment._id);
                    console.log("Kết quả cập nhật thanh toán [FULL]:", paymentResult);

                    // Nếu không thành công, vẫn tiếp tục với quá trình đặt vé
                    // Không throw error vì chúng ta vẫn muốn người dùng hoàn tất việc đặt vé
                    if (!paymentResult.success) {
                        console.warn("Không thể cập nhật trạng thái thanh toán:", paymentResult.message);
                        // Vẫn cho phép tiếp tục nếu đặt vé đã thành công
                    } else {
                        // Cập nhật thông tin showtime nếu có
                        if (paymentResult.showtime) {
                            console.log("Cập nhật thông tin showtime từ phản hồi thanh toán:", paymentResult.showtime);
                            setShowtime(paymentResult.showtime);
                        }
                    }
                } catch (paymentErr) {
                    console.error("Lỗi cập nhật payment [DETAIL]:", paymentErr);
                    // Vẫn cho phép tiếp tục nếu đặt vé đã thành công
                }
            } else {
                console.warn("Không tìm thấy thông tin thanh toán trong kết quả đặt vé");
            }

            // Navigate to success page or show success message
            setActiveStep(steps.length - 1);

            // Sau khi đặt vé thành công, cập nhật lại trạng thái ghế
            try {
                const updatedSeatsData = await getSeatsForShowtime(showtimeId);
                setSeats(updatedSeatsData.seats);
                console.log("Đã cập nhật lại trạng thái ghế");
            } catch (seatErr) {
                console.error("Lỗi cập nhật trạng thái ghế:", seatErr);
            }

            setLoading(false);
        } catch (err) {
            console.error("Lỗi đặt vé [FULL ERROR]:", err);
            if (err.response) {
                console.error("Error response:", err.response.status, err.response.data);
            }
            setLoading(false);

            let errorMessage = "Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    };

    // Get price for a seat type
    const getPriceForSeatType = (type) => {
        // First try to get price from backend
        const ticketFromBackend = ticketPrices.find(t => t.type === type);
        if (ticketFromBackend) {
            return ticketFromBackend.price;
        }

        // Fallback to predefined prices
        const predefinedTicket = SEAT_TYPES.find(t => t.value === type);
        return predefinedTicket ? predefinedTicket.price : 70000; // Default to standard price
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        return selectedSeats.reduce((total, seat) => {
            const seatType = seat.type || 'standard';
            return total + getPriceForSeatType(seatType);
        }, 0);
    };

    // Get the calculated total price
    const totalPrice = calculateTotalPrice();

    // Group selected seats by type for display
    const groupedSeats = selectedSeats.reduce((groups, seat) => {
        const type = seat.type || 'standard';
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(seat);
        return groups;
    }, {});

    // Xác định trạng thái ghế
    const getSeatStatus = (seat) => {
        if (!seat) return 'unavailable';
        if (selectedSeats.some(s => s._id === seat._id)) return 'selected';

        // Nếu seat status là booked hoặc sold, trả về trạng thái đó
        if (seat.status === 'booked' || seat.status === 'sold') {
            return seat.status;
        }

        // Kiểm tra nếu ghế có trong bookedSeats của showtime
        if (showtime && showtime.bookedSeats && Array.isArray(showtime.bookedSeats)) {
            const isBooked = showtime.bookedSeats.some(
                bookedSeat => {
                    const bookedSeatId = typeof bookedSeat === 'object' ?
                        (bookedSeat._id || bookedSeat.id) :
                        bookedSeat;
                    return bookedSeatId === seat._id;
                }
            );
            if (isBooked) return 'booked';
        }

        return seat.status || 'available';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading && !movie) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error && !loading && !movie) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </Container>
        );
    }

    // Render step content
    const getStepContent = (step) => {
        switch (step) {
            case 0: // Select seats
                return (
                    <Grid container spacing={4}>
                        {/* Phần bên trái - Sơ đồ ghế */}
                        <Grid item xs={12} md={8}>
                            {/* Màn hình */}
                            <Box
                                textAlign="center"
                                mb={5}
                            >
                                <Box
                                    sx={{
                                        width: '80%',
                                        height: '25px',
                                        bgcolor: '#e0e0e0',
                                        mx: 'auto',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography color="text.secondary" variant="body2">
                                        Màn hình
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Sơ đồ ghế */}
                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                {rows.map(row => (
                                    <Box key={row} display="flex" alignItems="center">
                                        {/* Kí hiệu hàng bên trái */}
                                        <Typography variant="body1" sx={{ width: 30, textAlign: 'center', fontWeight: 'bold' }}>
                                            {row}
                                        </Typography>

                                        {/* Các ghế */}
                                        <Box display="flex" gap={1}>
                                            {columns.map(col => {
                                                const seat = getSeatByPosition(row, col);
                                                const seatStatus = getSeatStatus(seat);
                                                const seatStyle = getSeatColor(seat);
                                                const isDisabled = !seat || seatStatus === 'sold';

                                                // Nếu không có ghế ở vị trí này
                                                if (!seat) {
                                                    return (
                                                        <Box
                                                            key={`${row}-${col}`}
                                                            sx={{
                                                                width: 35,
                                                                height: 35,
                                                                opacity: 0.3
                                                            }}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <Box
                                                        key={`${row}-${col}`}
                                                        sx={{
                                                            width: 35,
                                                            height: 35,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: seatStyle.backgroundColor,
                                                            color: seatStyle.color,
                                                            borderRadius: '4px',
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                            boxShadow: seatStyle.boxShadow || 'none',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                transform: isDisabled ? 'none' : 'translateY(-2px)',
                                                            }
                                                        }}
                                                        onClick={() => !isDisabled && handleSeatClick(seat)}
                                                    >
                                                        {col}
                                                    </Box>
                                                );
                                            })}
                                        </Box>

                                        {/* Kí hiệu hàng bên phải */}
                                        <Typography variant="body1" sx={{ width: 30, textAlign: 'center', fontWeight: 'bold' }}>
                                            {row}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Chú thích */}
                            <Box
                                display="flex"
                                justifyContent="center"
                                gap={2}
                                mt={4}
                                flexWrap="wrap"
                                sx={{ borderTop: '1px solid #eee', pt: 3 }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ width: 20, height: 20, backgroundColor: '#f44336', borderRadius: '4px' }} />
                                    <Typography variant="body2">Ghế đã đặt</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box sx={{ width: 20, height: 20, backgroundColor: '#ff9800', borderRadius: '4px' }} />
                                    <Typography variant="body2">Ghế đang chọn</Typography>
                                </Box>
                                {SEAT_TYPES.map(type => (
                                    <Box key={type.value} display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 20, height: 20, backgroundColor: type.color, borderRadius: '4px' }} />
                                        <Typography variant="body2">
                                            {type.label} - {formatCurrency(getPriceForSeatType(type.value))}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* Phần bên phải - Thông tin phim và đặt vé */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={movie?.posterUrl}
                                    alt={movie?.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {movie?.title}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                                        <strong> {room?.name || ''}</strong>
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        <strong>Suất: {showtime?.startTime}</strong> - {new Date(showtime?.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    {selectedSeats.length > 0 ? (
                                        <Box sx={{ mb: 2 }}>
                                            {Object.entries(groupedSeats).map(([type, seats]) => (
                                                <Box key={type} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {seats.length}x {SEAT_TYPES.find(t => t.value === type)?.label || 'Ghế'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatCurrency(getPriceForSeatType(type))} x {seats.length} = {formatCurrency(getPriceForSeatType(type) * seats.length)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                            <Typography variant="body2">
                                                Ghế: {selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')}
                                            </Typography>
                                            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mt: 2 }}>
                                                {formatCurrency(totalPrice)}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Vui lòng chọn ghế
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ArrowBackIcon />}
                                            onClick={() => navigate(-1)}
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={selectedSeats.length === 0}
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={handleNext}
                                        >
                                            Tiếp tục
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                );

            case 1: // Payment method selection
                return (
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom fontWeight="bold">
                                        Chọn phương thức thanh toán
                                    </Typography>

                                    <FormControl component="fieldset" sx={{ width: '100%', mt: 3 }}>
                                        <RadioGroup
                                            value={paymentMethod}
                                            onChange={handlePaymentMethodChange}
                                        >
                                            {PAYMENT_METHODS.map((method) => (
                                                <FormControlLabel
                                                    key={method.value}
                                                    value={method.value}
                                                    control={<Radio />}
                                                    label={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {method.icon}
                                                            <Typography>{method.label}</Typography>
                                                        </Box>
                                                    }
                                                    sx={{
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: 1,
                                                        p: 1,
                                                        mb: 1,
                                                        width: '100%',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>

                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Tóm tắt đơn hàng
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2">
                                                <strong>Phim:</strong> {movie?.title}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Suất chiếu:</strong> {new Date(showtime?.date).toLocaleDateString('vi-VN')} | {showtime?.startTime}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Phòng:</strong> {room?.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Ghế:</strong> {selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 1 }} />
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Tổng cộng:
                                            </Typography>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                {formatCurrency(totalPrice)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ArrowBackIcon />}
                                            onClick={handleBack}
                                        >
                                            Trở lại
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={handleNext}
                                        >
                                            Tiếp tục
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                );

            case 2: // Payment confirmation step (new)
                const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);

                return (
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                                <CardContent>
                                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                                        <PaymentIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" fontWeight="bold">
                                            Xác nhận thanh toán
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Vui lòng xác nhận thanh toán đơn hàng của bạn
                                        </Typography>
                                    </Box>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            mb: 3,
                                            bgcolor: 'background.default',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                    Chi tiết đơn hàng
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Phim:
                                                </Typography>
                                                <Typography variant="body1" gutterBottom fontWeight="medium">
                                                    {movie?.title}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Suất chiếu:
                                                </Typography>
                                                <Typography variant="body1" gutterBottom fontWeight="medium">
                                                    {new Date(showtime?.date).toLocaleDateString('vi-VN')} | {showtime?.startTime}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Phòng:
                                                </Typography>
                                                <Typography variant="body1" gutterBottom fontWeight="medium">
                                                    {room?.name}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Ghế:
                                                </Typography>
                                                <Typography variant="body1" gutterBottom fontWeight="medium">
                                                    {selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                            </Grid>

                                            {Object.entries(groupedSeats).map(([type, seats]) => (
                                                <Grid item xs={12} key={type}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2">
                                                            {seats.length}x {SEAT_TYPES.find(t => t.value === type)?.label || 'Ghế'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {formatCurrency(getPriceForSeatType(type) * seats.length)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}

                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Tổng thanh toán:
                                                    </Typography>
                                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                        {formatCurrency(totalPrice)}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Box sx={{
                                                    p: 2,
                                                    mt: 2,
                                                    bgcolor: '#f5f5f5',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <Box sx={{ mr: 2 }}>
                                                        {selectedPaymentMethod?.icon || <CreditCardIcon />}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Phương thức thanh toán
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedPaymentMethod?.label || paymentMethod}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Bằng việc nhấn nút "Xác nhận thanh toán", bạn đồng ý với các điều khoản và điều kiện của dịch vụ.
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ArrowBackIcon />}
                                            onClick={handleBack}
                                        >
                                            Quay lại
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartCheckoutIcon />}
                                            onClick={handleNext}
                                            sx={{ px: 3 }}
                                        >
                                            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                );

            case 3: // Success step
                // Kiểm tra thông tin showtime và movie hợp lệ
                const isShowtimeValid = showtime && typeof showtime === 'object';
                const isMovieValid = movie && typeof movie === 'object';

                // Định dạng giờ chiếu an toàn
                const getFormattedStartTime = () => {
                    try {
                        if (isShowtimeValid && showtime.startTime) {
                            return new Date(showtime.startTime).toLocaleString('vi-VN');
                        }
                        return 'N/A';
                    } catch (err) {
                        console.error("Lỗi định dạng thời gian:", err);
                        return 'N/A';
                    }
                };

                // Thông tin phòng chiếu an toàn
                const getRoomInfo = () => {
                    try {
                        if (isShowtimeValid && showtime.room) {
                            const roomName = typeof showtime.room === 'object' ? showtime.room.name : 'N/A';
                            const cinemaName = showtime.room.cinema && typeof showtime.room.cinema === 'object'
                                ? showtime.room.cinema.name
                                : 'N/A';
                            return `${roomName} - ${cinemaName}`;
                        }
                        return 'N/A';
                    } catch (err) {
                        console.error("Lỗi lấy thông tin phòng chiếu:", err);
                        return 'N/A';
                    }
                };

                return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 4
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2
                                }}
                            >
                                <CheckIcon sx={{ fontSize: 40, color: '#fff' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Đặt vé thành công!
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Cảm ơn bạn đã đặt vé tại rạp của chúng tôi
                            </Typography>
                        </Box>

                        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Thông tin đặt vé
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Phim:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {isMovieValid ? movie?.title : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Suất chiếu:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {getFormattedStartTime()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Phòng chiếu:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {getRoomInfo()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Số ghế:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedSeats && selectedSeats.length > 0
                                            ? selectedSeats.map(seat => seat.row && seat.column ? `${seat.row}${seat.column}` : seat.seatNumber || '').filter(s => s).join(', ')
                                            : 'N/A'
                                        }
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Phương thức thanh toán:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label || paymentMethod}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Thành tiền:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalPrice)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/profile')}
                                startIcon={<PersonIcon />}
                            >
                                Xem vé của tôi
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/')}
                                startIcon={<HomeIcon />}
                            >
                                Về trang chủ
                            </Button>
                        </Box>
                    </Box>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Tiêu đề */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Đặt suất chiếu
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: 1 }}
                >
                    {showtime?.startTime}
                </Button>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Content based on active step */}
            {getStepContent(activeStep)}

            {/* Improved error display */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        width: '100%',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
        </Container>
    );
};

export default Booking;  