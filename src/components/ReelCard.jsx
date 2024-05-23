import * as React from 'react';
import { Box, Typography, Button, useTheme,IconButton, Card, CardMedia, CardContent, CardActions, Accordion, AccordionActions, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import { ClosedCaptionOffOutlined, TuneOutlined, EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined } from '@mui/icons-material';

const ReelCard = ({chapter, chapterMakerName, chapterTranscript, episodeTranscript, startTime, endTime, src}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <div>
            <Accordion>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                >
                    Chapter {chapter}
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" justifyContent="space-between" alignItems="cneter">
                        <Button size="large" color='secondary' variant='outlined' startIcon={<ClosedCaptionOffOutlined />}>Caption</Button>
                        <Button size="large" color='secondary' variant='outlined' startIcon={<TuneOutlined />}>Design</Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default ReelCard; 
