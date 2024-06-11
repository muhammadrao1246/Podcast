import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "src/theme";
import Header from "src/components/Layouts/Header/Header";
import { mockDataChapters } from "src/data/mockData";
import ReelCard from "src/components/reels/ReelCard";

const Reels = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            <Header title="Reel Maker" subtitle="List of all Reels" />

            <Box sx={{ flexGrow: 1 }}>
                {mockDataChapters.map(chapter => (
                    <ReelCard 
                        key={chapter.id}
                        chapter={chapter.chapter} 
                        chapterMakerName={chapter.chapterMakerName} 
                        chapterTranscript={chapter.chapterTranscript} 
                        episodeTranscript={chapter.episodeTranscript}
                        startTime={chapter.startTime}
                        endTime={chapter.endTime}
                        src={chapter.src}/>
                ))}
            </Box>
        </Box>
    );
}

export default Reels;