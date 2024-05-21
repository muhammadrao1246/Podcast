import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import EpisodeCard from "../../components/EpisodeCard";

const Episodes = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box m="20px">
            <Header title="Episodes" subtitle="List of all Episodes" />
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