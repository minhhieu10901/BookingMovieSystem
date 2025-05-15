import React, { Fragment, useEffect, useState } from 'react';
import { getAdminById, deleteMovie } from '../api-helpers/api-helpers';
import { Box, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AdminProfile = () => {
    const [admin, setAdmin] = useState();

    useEffect(() => {
        getAdminById()
            .then((res) => setAdmin(res.admin))
            .catch((err) => console.log(err));
    }, []);

    const handleDelete = (movieId) => {
        deleteMovie(movieId)
            .then(() => {
                setAdmin((prevAdmin) => ({
                    ...prevAdmin,
                    addedMovies: prevAdmin.addedMovies.filter((movie) => movie._id !== movieId),
                }));
            })
            .catch((err) => console.log(err));
    };

    return (
        <Box width="100%" display="flex">
            <Fragment>
                {admin && (
                    <Box flexDirection="column" justifyContent="center" alignItems="center" width="30%" padding={3}>
                        <AccountCircleIcon sx={{ fontSize: "5rem", textAlign: "center", ml: 5 }} />
                        <Typography mt={2} padding={1} width="auto" textAlign="center" border="1px solid #ccc" borderRadius={4}>
                            {admin.email}
                        </Typography>
                    </Box>
                )}

                {admin && admin.addedMovies.length > 0 && (
                    <Box width="70%" display="flex" flexDirection="column">
                        <Typography variant="h3" fontFamily="verda" textAlign="center" padding={2}>
                            Added Movies
                        </Typography>
                        <Box margin="auto" display="flex" flexDirection="column" width="80%">
                            <List>
                                {admin.addedMovies.map((movie, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{ backgroundColor: "#00d386", color: "white", textAlign: "center", margin: 1 }}
                                    >
                                        <ListItemText sx={{ margin: 1, width: "auto", textAlign: "left" }}>
                                            Movie: {movie.title}
                                        </ListItemText>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDelete(movie._id)}
                                        >
                                            Delete
                                        </Button>
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

export default AdminProfile;
