import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMovieDetails } from '../../api-helpers/api-helpers';
import { Box, Typography } from '@mui/material';

const Booking = () => {
    const [movie, setMovie] = useState({});
    const id = useParams().id;
    console.log("id", id);
    useEffect(() => {
        getMovieDetails(id)
            .then((res) => setMovie(res.movie))
            .catch((err) => console.log(err))
    }, [id])
    console.log(movie);
    return (
        <div>
            {movie && (
                <Fragment>
                    <Typography padding={3} fontFamily="fantasy" variant="h4" textAlign={"center"} >
                        Booking Tickets Of Movie: {movie.title}
                    </Typography>
                    <Box display="flex" justifyContent="center">

                        <Box
                            display="flex"
                            flexDirection="column"
                            paddingTop={3}
                            width="50%"
                        //marginRight={"auto"}
                        >

                        </Box>

                        <img width={"40%"} height={"50%"} src={movie.posterUrl} alt={movie.title} />
                        <Box />
                        <Box width={"80%"} marginTop={3} padding={2}>
                            <Typography paddingTop={2}>
                                {movie.description}
                            </Typography>
                            
                            <Typography fontWeight={"bold"} marginTop={1}>
                                {movie.actors}
                            </Typography>
                        </Box>
                    </Box>
                </Fragment>
            )}
        </div>
    );
}

export default Booking