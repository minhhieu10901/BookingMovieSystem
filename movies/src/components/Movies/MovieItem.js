import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';

const MovieItem = ({ title, releaseDate, posterUrl, id }) => {
  return (
    <Card sx={{
      margin: 2, width: 250, height: 400, borderRadius: 5, ":hover":
        { boxShadow: "10px 10px 20px #ccc" },
    }}>
      <img height={'65%'} width="100%" src={posterUrl} alt={title} />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {
            new Date(releaseDate).toLocaleDateString("vi-VN")
          }
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
        variant='contained' 
        fullWidth 
        LinkComponent={Link} to={`/booking/${id}`} 
        sx={{ margin: "auto", bgcolor:"#2b2d42",":hover": {
                            backgroundColor: "#121217"
                        }, }} 
        size="small">
          Booking
        </Button>
      </CardActions>
    </Card>
  );
}

export default MovieItem