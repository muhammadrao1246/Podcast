import * as React from 'react';
import { Typography, Button, useTheme, Card, CardMedia, CardContent, CardActions } from "@mui/material";
import { tokens } from "../theme";

const EpisodeCard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Card sx={{ gridColumn: "span 2" }}>
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
            <CardActions sx={{ backgroundColor: `${colors.primary[400]} !important`, p: "15px" }}>
                <Button size="small" color='secondary' variant='contained' href='/chapters'>Chapters</Button>
                <Button size="small" color='secondary' variant='contained' >Reels</Button>
            </CardActions>
        </Card>
    );
}

export default EpisodeCard; 
