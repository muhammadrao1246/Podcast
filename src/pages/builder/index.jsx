import React from "react";

import { tokens } from "src/theme";

import { Box, Button, useTheme } from "@mui/material";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Link, useOutletContext } from "react-router-dom";

import Header from "src/components/Layouts/Header/Header";
import EpisodeCard from "src/components/episodes/EpisodeCard";
import { useGetEpisodesListMutation } from "src/services/api";
import { ROUTES } from "src/routes";


const Builder = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useOutletContext().loader

    const [data, setData] = React.useState([])
    const [apiErrors, SetApiErrors] = React.useState({})
    const [getEpisodes, {isLoading}] = useGetEpisodesListMutation()


    const getEpisodesfunc = async ()=>{
        setLoading(true)
        const response = await getEpisodes()
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
            
        } else {
            console.log("Login Success")
            let dataObject = response.data.data;
            setData(dataObject.results)
            // const {access_token} =  getToken()
            console.log(dataObject)
        }
        setLoading(false)
    }

    React.useEffect(()=>{
        getEpisodesfunc()
    }, [])



    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
            <Header title="Builders" subtitle="List of all Builders" />
                <Box>
                    <Button
                        sx={{
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                        LinkComponent={Link}
                        to={ROUTES.EPISODES_ADD}
                    >
                        <VideoCallOutlinedIcon sx={{ mr: "10px" }} />
                        Add New Episode
                    </Button>
                    <Button
                        sx={{
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        marginLeft: "10px",
                        }}
                        LinkComponent={Link}
                        to={ROUTES.EPISODES_BOOK}
                    >
                        <CalendarTodayOutlinedIcon sx={{ mr: "10px" }} />
                        Book Episode
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Box display="grid" gap="20px" gridTemplateColumns="repeat(6, minmax(0, 1fr))">
                    {/* {Array.from(Array(6)).map((_, index) => ( */}
                    { data.map((ep, index)=>
                        <EpisodeCard key={ep.id}
                            id={ep.id}
                            title={ep.title}
                            content={ep.content}
                            start_time={ep.start_time}
                            end_time={ep.end_time}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default Builder;