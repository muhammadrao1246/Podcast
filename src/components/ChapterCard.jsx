import * as React from 'react';
import { Typography, Button, useTheme, Box, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import { EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined } from '@mui/icons-material';

const ChapterCard = ({chapter, chapterMakerName, chapterTranscript, episodeTranscript, startTime, endTime, src}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            <Box display="flex" alignItems="center" gap="40px">
                <Typography variant="h2">
                    {chapter}
                </Typography>
                <Typography variant="h3" color={colors.greenAccent[400]}>
                    {chapterMakerName}
                </Typography>
            </Box>
            <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
            >
                <Box mt="20px" borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 3" }}>
                    <Typography borderRadius="10px" p="20px" bgcolor={colors.grey[500]} sx={{ height: '400px', overflow: 'auto', }} >{chapterTranscript}</Typography>
                    {/* <Typography borderRadius="0 0 10px 10px" p="20px" bgcolor={colors.grey[800]}>{episodeTranscript}</Typography> */}
                </Box>
                <Box mt="20px" display="flex" justifyContent="space-between" flexDirection="column" p="10px" borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 1" }}>
                    <img
                    alt="chapterImage"
                    width="100%"
                    src={`${src}`}
                    />
                    <Box borderRadius="10px" bgcolor={colors.grey[600]} display="flex" justifyContent="space-between" alignItems="center" p="10px" width="100%">
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
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gridColumn: "span 3" }}>
                    <Box display="flex" alignItems="center">
                        <Typography borderRadius="10px" p="15px 30px" bgcolor={colors.grey[800]} >{startTime}</Typography>
                        <Typography borderRadius="10px" p="15px 30px" bgcolor={colors.grey[800]} ml="20px" >{endTime}</Typography>
                    </Box>
                    <Button size="large" color='secondary' variant='contained' >Generate</Button>
                </Box>
            </Box>
        </Box>
    );
}

export default ChapterCard; 
