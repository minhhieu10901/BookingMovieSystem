import { Box, Dialog, FormLabel, TextField, Typography } from '@mui/material'
import React from 'react'

const AuthForm = () => {
    return (<Dialog open={true} >
        <Typography variant='h4' textAlign="center">
            Login
        </Typography>
        <form>
            <Box
                padding={6}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                width="400"
                margin="auto"
                alignContent="center"
            >
                <FormLabel>Email</FormLabel>
                <TextField type={'email'} name="email" />
                <FormLabel>Password</FormLabel>
                <TextField type={'password'} name="password" />
            </Box>
        </form>
    </Dialog>
    );
}

export default AuthForm