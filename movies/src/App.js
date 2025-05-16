import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Movies from "./components/Movies/Movies";
import Admin from "./components/Admin/Admin";
import Auth from "./components/Auth/Auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { adminActions, userActions } from "./store";
import Booking from "./components/Bookings/Booking";
import UserProfile from "./components/Profile/UserProfile";
import AdminProfile from "./components/Profile/AdminProfile";
import Dashboard from "./components/Admin/Dashboard/Dashboard";
import MovieManagement from "./components/Admin/Movies/MovieManagement";
import AddMovieForm from "./components/Admin/Movies/AddMovieForm";
import EditMovieForm from "./components/Admin/Movies/EditMovieForm";
import CinemaManagement from "./components/Admin/Cinemas/CinemaManagement";
import AddCinemaForm from "./components/Admin/Cinemas/AddCinemaForm";
import EditCinemaForm from "./components/Admin/Cinemas/EditCinemaForm";
import RoomManagement from "./components/Admin/Rooms/RoomManagement";
import AddRoomForm from "./components/Admin/Rooms/AddRoomForm";
import EditRoomForm from "./components/Admin/Rooms/EditRoomForm";
import RoomSeatManagement from "./components/Admin/Rooms/SeatManagement";
import SeatManagement from "./components/Admin/Seats/SeatManagement";
import ShowtimeManagement from "./components/Admin/Showtimes/ShowtimeManagement";
import TicketManagement from "./components/Admin/Tickets/TicketManagement";
import BookingManagement from "./components/Admin/Bookings/BookingManagement";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import { theme } from './theme';

function App() {
  const dispatch = useDispatch();
  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
  console.log("isAdminLoggedIn", isAdminLoggedIn);
  console.log("isUserLoggedIn", isUserLoggedIn);
  useEffect(() => {
    if (localStorage.getItem("userId")) {
      dispatch(userActions.login());
    } else if (localStorage.getItem("adminId")) {
      dispatch(adminActions.login());
    }
  }, [dispatch])// them dispatch vao de ko bi loi khi reload trang
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        {/* Tất cả các trang admin không có Header và Container */}
        {isAdminLoggedIn && !isUserLoggedIn && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Quản lý phim */}
            <Route path="/movies-management" element={<MovieManagement />} />
            <Route path="/add" element={<AddMovieForm />} />
            <Route path="/edit-movie/:id" element={<EditMovieForm />} />

            {/* Quản lý rạp chiếu */}
            <Route path="/cinemas-management" element={<CinemaManagement />} />
            <Route path="/add-cinema" element={<AddCinemaForm />} />
            <Route path="/edit-cinema/:id" element={<EditCinemaForm />} />

            {/* Quản lý phòng chiếu */}
            <Route path="/rooms-management" element={<RoomManagement />} />
            <Route path="/add-room" element={<AddRoomForm />} />
            <Route path="/edit-room/:id" element={<EditRoomForm />} />
            <Route path="/seat-management/:roomId" element={<RoomSeatManagement />} />

            {/* Quản lý suất chiếu */}
            <Route path="/showtimes-management" element={<ShowtimeManagement />} />
            <Route path="/seats-management" element={<SeatManagement />} />
            <Route path="/tickets-management" element={<TicketManagement />} />
            <Route path="/bookings-management" element={<BookingManagement />} />
            <Route path="/payments-management" element={<Dashboard />} />
            <Route path="/accounts-management" element={<Dashboard />} />
          </>
        )}

        {/* Các route khác vẫn sử dụng Header và Container */}
        <Route path="*" element={
          <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Header />
            <Container
              component="main"
              sx={{
                flex: 1,
                py: 4,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<Movies />} />
                {!isUserLoggedIn && !isAdminLoggedIn && (
                  <>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/auth" element={<Auth />} />
                  </>
                )}
                {isUserLoggedIn && !isAdminLoggedIn && (
                  <>
                    <Route path="/user" element={<UserProfile />} />
                    <Route path="/booking/:id" element={<Booking />} />
                  </>
                )}
                {isAdminLoggedIn && !isUserLoggedIn && (
                  <>
                    <Route path="/user-admin" element={<AdminProfile />} />
                  </>
                )}
              </Routes>
            </Container>
          </Box>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
