import React, { Fragment, useEffect, useState } from 'react'
import { deleteBooking, getUserBookings, getUserDetails } from '../api-helpers/api-helpers';
import { Box, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const UserProfile = () => {
    const [bookings, setBookings] = useState();
    const [user, setUser] = useState()
    useEffect(() => {
        // Fetch user profile data here
        getUserBookings()
            .then((res) => setBookings(res.bookings))
            .catch((err) => console.log(err));
        getUserDetails()
            .then((res) => setUser(res.user))
            .catch((err) => console.log(err));
    }, []);
    const handleDelete = (id) => {
        deleteBooking(id)
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
    };
    return (<Box width={"100%"} display={"flex"}>
        <Fragment>
            {" "}
            {user && (
                <Box
                    flexDirection={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    width={"30%"}
                    padding={3}>
                    <AccountCircleIcon sx={{ fontSize: "5rem", textAlign: "center", ml: 5 }} />
                    <Typography
                        padding={1}
                        width={"auto"}
                        textAlign={"center"}
                        border={"1px solid #ccc"}
                        borderRadius={4}>
                        <b>ID:</b> {user._id}
                    </Typography>
                    <Typography
                        padding={1}
                        width={"auto"}
                        textAlign={"center"}
                        border={"1px solid #ccc"}
                        borderRadius={4}
                        mt={2}
                    >
                        <b>Name:</b> {user.name}
                    </Typography>
                    <Typography
                        mt={2}
                        padding={1}
                        width={"auto"}
                        textAlign={"center"}
                        border={"1px solid #ccc"}
                        borderRadius={4}>
                        <b>Email:</b> {user.email}
                    </Typography>
                    {user.createdAt && (
                        <Typography
                            mt={2}
                            padding={1}
                            width={"auto"}
                            textAlign={"center"}
                            border={"1px solid #ccc"}
                            borderRadius={4}>
                            <b>Created At:</b> {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                    )}
                    {user.role && (
                        <Typography
                            mt={2}
                            padding={1}
                            width={"auto"}
                            textAlign={"center"}
                            border={"1px solid #ccc"}
                            borderRadius={4}>
                            <b>Role:</b> {user.role}
                        </Typography>
                    )}
                </Box>
            )}
            {bookings &&
                (bookings.length > 0) &&
                (
                    <Box width={"70%"} display={"flex"} flexDirection={"column"} >
                        <Typography variant="h3" fontFamily={"verda"} textAlign={"center"} padding={2}>
                            Bookings
                        </Typography>
                        <Box margin={"auto"} display={"flex"} flexDirection={"column"} width={"80%"}>
                            <List>
                                {bookings.map((booking, index) => (
                                    <ListItem sx={{ backgroundColor: "#00d386", color: "white", textAlign: "center", margin: 1 }}>
                                        <ListItemText sx={{ margin: 1, width: "auto", textAlign: "left" }}>
                                            Movie: {booking.movie.title}
                                        </ListItemText>
                                        <ListItemText sx={{ margin: 1, width: "auto", textAlign: "left" }}>
                                            Seat Number: {booking.seatNumber}
                                        </ListItemText>
                                        <ListItemText sx={{ margin: 1, width: "auto", textAlign: "left" }}>
                                            Date: {new Date(booking.date).toLocaleDateString()}
                                        </ListItemText>
                                        <IconButton onClick={() => handleDelete(booking._id)} color='error'>
                                            <DeleteForeverIcon sx={{ color: "red" }} />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                )}
        </Fragment>

    </Box>
    );
};

export default UserProfile