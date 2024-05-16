import { Box, useTheme, Grid } from "@mui/material";
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
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {Array.from(Array(6)).map((_, index) => (
                    <Grid item xs={2} sm={4} md={4} key={index}>
                        <EpisodeCard />
                    </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default Episodes;