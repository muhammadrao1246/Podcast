import * as React from 'react';
import { Typography, Button, useTheme, Card, CardMedia, CardContent, CardActions, IconButton } from "@mui/material";
import { tokens } from "../theme";
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

const EpisodeCard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Card sx={{ maxWidth: 345 }}>
        <CardMedia
            sx={{ height: 140, backgroundColor: `${colors.primary[400]} !important` }}
            image={`../../assets/episode.png`}
            title="green iguana"
        />
        <CardContent sx={{ backgroundColor: `${colors.primary[400]} !important` }}>
            <Typography gutterBottom variant="h5" component="div" color={colors.greenAccent[300]}>
            Akil Horswen
            </Typography>
            <Typography variant="body" color={colors.grey[100]}>
                Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.
            </Typography>
        </CardContent>
        <CardActions sx={{ backgroundColor: `${colors.primary[400]} !important` }}>
            <IconButton>
                <FavoriteOutlinedIcon sx={{ color: `${colors.redAccent[500]} !important` }} />
            </IconButton>
            <Button size="small" variant='string'sx={{ color: `${colors.blueAccent[400]} !important` }} >Learn More</Button>
        </CardActions>
        </Card>
    );
}

export default EpisodeCard; 
