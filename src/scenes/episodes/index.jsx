import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import EpisodeCard from "../../components/EpisodeCard";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Link } from "react-router-dom";
import { useGetEpisodesListMutation } from "../../app/api";
import React from "react";

const Episodes = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const [data, setData] = React.useState([])
    const [apiErrors, SetApiErrors] = React.useState({})
    const [getEpisodes, {isLoading}] = useGetEpisodesListMutation()


    const getEpisodesfunc = async ()=>{
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
    }

    React.useEffect(()=>{
        getEpisodesfunc()
    }, [])



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
                    <Button
                        sx={{
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        marginLeft: "10px",
                        }}
                        href="/bookEpisode"
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

export default Episodes;