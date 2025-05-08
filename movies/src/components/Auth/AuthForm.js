import { Box, Button, Dialog, FormLabel, IconButton, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Link } from 'react-router-dom';
const labelStyle = {
    mt: 1,
    mb: 1,
}
const AuthForm = ({ onSubmit, isAdmin }) => {
    const [inputs, setInputs] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [isSignUp, setIsSignUp] = useState(false);
    const handleChange = (e) => {
        setInputs((prevState) => ({ ...prevState, [e.target.name]: e.target.value }))
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ inputs, signup: isAdmin ? false : isSignUp });
    }
    return (<Dialog sx={{ "& .MuiDialog-paper": { width: "500px", borderRadius: 6 } }} open={true} >
        <Box sx={{ ml: "auto", padding: 1 }}>
            <IconButton LinkComponent={Link} to="/">
                <CloseRoundedIcon />
            </IconButton>
        </Box>
        <Typography variant='h4' textAlign="center">
            {isSignUp ? "Sign Up" : "Login"}
        </Typography>
        <form onSubmit={handleSubmit}>
            <Box
                padding={6}
                display="flex"
                flexDirection="column"
                justifyContent="center"

                margin="auto"
                alignContent="center"
            >
                {!isAdmin && isSignUp && (
                    <> {""}
                        <FormLabel sx={labelStyle}>Name</FormLabel>
                        <TextField
                            value={inputs.name}
                            onChange={handleChange}
                            margin="normal"
                            variant="standard"
                            type={"text"}
                            name="name" />
                    </>
                )}
                <FormLabel sx={labelStyle}>Email</FormLabel>
                <TextField
                    value={inputs.email}
                    onChange={handleChange}
                    margin="normal"
                    variant="standard"
                    type={"email"}
                    name="email" />
                <FormLabel sx={labelStyle}>Password</FormLabel>
                <TextField
                    value={inputs.password}
                    onChange={handleChange}
                    margin="normal"
                    variant="standard"
                    type={"password"}
                    name="password" />
                <Button sx={{ mt: 2, borderRadius: 10, bgcolor: "#2d2b42" }} type="submit" fullWidth variant="contained">
                    {isSignUp ? "Sign Up" : "Login"}
                </Button>
                {!isAdmin && (<Button onClick={() => setIsSignUp(!isSignUp)} sx={{ mt: 2, borderRadius: 10 }} fullWidth >
                    Switch To {isSignUp ? "Login" : "Sign Up"}
                </Button>)}
            </Box>
        </form>
    </Dialog>
    );
}

export default AuthForm