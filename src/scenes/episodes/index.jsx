import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import EpisodeCard from "../../components/EpisodeCard";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';

const Episodes = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Episodes" subtitle="List of all Episodes" />
                <Box>
                    <Button
                        sx={{
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                        href="/createEpisode"
                    >
                        <VideoCallOutlinedIcon sx={{ mr: "10px" }} />
                        Add New Episode
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Box display="grid" gap="20px" gridTemplateColumns="repeat(6, minmax(0, 1fr))">
                    {Array.from(Array(6)).map((_, index) => (
                        <EpisodeCard />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export default Episodes;