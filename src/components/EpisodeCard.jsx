import * as React from 'react';
import { Typography, Button, useTheme, Card, CardMedia, CardContent, CardActions } from "@mui/material";
import { tokens } from "../theme";

const EpisodeCard = ({id, image, title, content, start_time, end_time}) => {
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
                {title}
                </Typography>
                <Typography variant="body" color={colors.grey[100]}>
                    {content}
                </Typography>
            </CardContent>
            <CardActions sx={{ backgroundColor: `${colors.primary[400]} !important`, p: "15px" }}>
                <Button size="small" color='secondary' variant='contained' href={`/episodes/${id}/chapters`}>Chapters</Button>
                <Button size="small" color='secondary' variant='contained' href={`/episodes/${id}/reels`}>Reels</Button>
            </CardActions>
        </Card>
    );
}

export default EpisodeCard; 
