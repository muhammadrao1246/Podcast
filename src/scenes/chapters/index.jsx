import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { mockDataChapters } from "../../data/mockData";
import ChapterCard from "../../components/ChapterCard";

const Chapters = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            <Header title="Chapter Selection" subtitle="List of all Chapters" />

            <Box sx={{ flexGrow: 1 }}>
                {mockDataChapters.map(chapter => (
                    <ChapterCard 
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

export default Chapters;