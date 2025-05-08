import React, { useEffect, useState } from "react";
import { AppBar, Box, Toolbar, Autocomplete, TextField, Tab, Tabs, IconButton } from "@mui/material";
import MovieIcon from '@mui/icons-material/Movie';
import { getAllMovies } from "../api-helpers/api-helpers.js";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "../store/";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const [value, setValue] = useState(0);
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err));
    }, []);
    const logout = (isAdmin) => {
        dispatch(isAdmin ? adminActions.logout() : userActions.logout())
    }
    const handleChange = (e, val) => {

        const movie = movies.find((m) => m.title === val);
        console.log(movie);
        if(isUserLoggedIn){
            navigate(`/booking/${movie._id}`)
        }
    }
    return <AppBar position="sticky" sx={{ bgcolor: "#2E3B55" }} >
        <Toolbar>
            <Box width={"20%"}>
                <IconButton LinkComponent={Link} to="/">
                    <MovieIcon />
                </IconButton>
            </Box>
            <Box width={"30%"} margin={"auto"} >
                <Autocomplete
                    onChange={handleChange}
                    width={"100%"}
                    freeSolo
                    options={movies && movies.map((option) => option.title)}
                    renderInput={(params) =>
                        <TextField sx={{ input: { color: "white" } }} variant="standard" {...params} label="Search Movies" />}
                />
            </Box>
            <Box display={"flex"} >
                <Tabs indicatorColor="secondary" textColor="inherit" value={value} onChange={(e, val) => setValue(val)}>
                    <Tab LinkComponent={Link} to="/movies" label="Movies" />

                    {!isAdminLoggedIn && !isUserLoggedIn &&
                        [
                            <Tab LinkComponent={Link} to="/admin" label="Admin" key="admin" />,
                            <Tab LinkComponent={Link} to="/auth" label="Auth" key="auth" />
                        ]
                    }

                    {isUserLoggedIn &&
                        [
                            <Tab LinkComponent={Link} to="/user" label="Profile" key="user" />,
                            <Tab onClick={() => logout(false)} LinkComponent={Link} to="/" label="Logout" key="logoutUser" />
                        ]
                    }

                    {isAdminLoggedIn &&
                        [
                            <Tab LinkComponent={Link} to="/add" label="Add Movies" key="addMovies" />,
                            <Tab LinkComponent={Link} to="/user-admin" label="Profile" key="profileAdmin" />,
                            <Tab onClick={() => logout(true)} LinkComponent={Link} to="/" label="Logout" key="logoutAdmin" />
                        ]
                    }
                </Tabs>
            </Box>
        </Toolbar>
    </AppBar>
}
export default Header;