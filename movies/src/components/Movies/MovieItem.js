import { Button, Card, CardActions, CardContent, Typography, Box, Chip, Rating } from '@mui/material';
import React from 'react'
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const MovieItem = ({ title, releaseDate, posterUrl, id, duration, genre, rating, badge, highlighted }) => {
  return (
    <Card
      sx={{
        width: 200,
        minWidth: 180,
        maxWidth: 220,
        height: 480,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: highlighted ? '0 0 20px rgba(244, 67, 54, 0.5)' : 2,
        mx: 'auto',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.03)',
          boxShadow: highlighted ? '0 8px 30px rgba(244, 67, 54, 0.5)' : '0 8px 24px rgba(0,0,0,0.18)',
        },
        border: highlighted ? '2px solid #f44336' : 'none',
      }}
    >
      <Box
        sx={{ position: 'relative', width: '100%', height: 0, paddingTop: '150%' }}
        component={Link}
        to={`/movies/${id}`}
      >
        <img
          src={posterUrl}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        />
        <Box
          className="play-icon"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
        {genre && (
          <Chip
            label={genre}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            }}
          />
        )}

        {badge && (
          <Chip
            icon={<WhatshotIcon />}
            label={badge}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(244, 67, 54, 0.9)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 1)',
              }
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 1.2 }}>
        <Typography
          gutterBottom
          variant="subtitle1"
          component="div"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.2,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: highlighted ? 'error.main' : 'inherit',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={rating || 0}
            precision={0.5}
            size="small"
            readOnly
          />
          <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
            {rating || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {new Date(releaseDate).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>

        {duration && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {duration} phút
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 1.2, pt: 0 }}>
        <Button
          variant='contained'
          fullWidth
          component={Link}
          to={`/movies/${id}`}
          sx={{
            py: 0.7,
            backgroundColor: highlighted ? 'error.main' : '#2b2d42',
            '&:hover': {
              backgroundColor: highlighted ? 'error.dark' : '#121217'
            },
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.95rem'
          }}
        >
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
}

export default MovieItem