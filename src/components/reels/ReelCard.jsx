import * as React from 'react';
import { Box, Typography, Button, useTheme,IconButton, Card, CardMedia, CardContent, CardActions, Accordion, AccordionActions, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "src/theme";
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
                    <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                        sx={{
                            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                        }}
                    >
                        <Box borderRadius="10px" sx={{ gridColumn: "span 3" }}>
                            <Box display="flex" justifyContent="space-between" alignItems="cneter">
                                <Button size="large" color='secondary' variant='outlined' startIcon={<ClosedCaptionOffOutlined />}>Caption</Button>
                                <Button size="large" color='secondary' variant='outlined' startIcon={<TuneOutlined />}>Design</Button>
                            </Box>
                        </Box>
                        <Box borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 3" }}>
                            <Typography borderRadius="10px" p="20px" bgcolor={colors.grey[800]}>{episodeTranscript}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" flexDirection="column" p="10px" borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 1" }}>
                            <img
                            alt="chapterImage"
                            width="100%"
                            src={`${src}`}
                            />
                            <Box mt="20px" mb="20px" borderRadius="10px" bgcolor={colors.grey[600]} display="flex" justifyContent="space-between" alignItems="center" p="10px" width="100%">
                                <IconButton>
                                    <ShareOutlined />
                                </IconButton>
                                <IconButton>
                                    <OndemandVideoOutlined />
                                </IconButton>
                                <IconButton>
                                    <FileDownloadOutlined />
                                </IconButton>
                                <IconButton>
                                    <EditOutlined />
                                </IconButton>
                            </Box>
                            <Button size="large" color='secondary' variant='contained' >Generate</Button>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default ReelCard; 
