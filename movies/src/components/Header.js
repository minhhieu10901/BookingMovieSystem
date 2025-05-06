import React, { useEffect, useState } from "react";
import { AppBar, Box, Toolbar, Autocomplete, TextField, Tab, Tabs } from "@mui/material";
import MovieIcon from '@mui/icons-material/Movie';
import { getAllMovies } from "../api-helpers/api-helpers.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminActions, userActions } from "../store/";

const Header = () => {
    const dispatch = useDispatch();
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn);
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const [value, setValue] = useState(0);
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        getAllMovies()
            .then((data) => setMovies(data.movies))
            .catch((err) => console.log(err));
    }, []);
    const logout =(isAdmin) => {
        dispatch(isAdmin?adminActions.logout() : userActions.logout())
    }
    return <AppBar position="sticky" sx={{ bgcolor: "#2E3B55" }} >
        <Toolbar>
            <Box width={"20%"}>
                <MovieIcon />
            </Box>
            <Box width={"30%"} margin={"auto"} >
                <Autocomplete width={"100%"}
                    //id="free-solo-demo"
                    freeSolo
                    options={movies && movies.map((option) => option.title)}
                    renderInput={(params) =>
                        <TextField sx={{ input: { color: "white" } }} variant="standard" {...params} label="Search Movies" />}
                />
            </Box>
            <Box display={"flex"} >
                <Tabs indicatorColor="secondary" textColor="inherit" value={value} onChange={(e, val) => setValue(val)}>
                    <Tab LinkComponent={Link} to="/movies" label="Movies" />
                    {!isAdminLoggedIn && !isUserLoggedIn && (<>
                        <Tab LinkComponent={Link} to="/admin" label="Admin" />
                        <Tab LinkComponent={Link} to="/auth" label="Auth" />
                    </>)}
                    {isUserLoggedIn && (<>
                        <Tab LinkComponent={Link} to="/user" label="Profile" />
                        <Tab onClick={()=>logout(false)} LinkComponent={Link} to="/" label="Logout" />
                    </>)}
                    {isAdminLoggedIn && (<>
                        <Tab LinkComponent={Link} to="/add" label="Add Movies" />
                        <Tab LinkComponent={Link} to="/admin" label="Profile" />
                        <Tab onClick={()=>logout(true)} LinkComponent={Link} to="/" label="Logout" />
                    </>)}
                </Tabs>
            </Box>
        </Toolbar>
    </AppBar>
}
export default Header;