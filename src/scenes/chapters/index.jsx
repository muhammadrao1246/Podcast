import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { mockDataChapters } from "../../data/mockData";
import ChapterCard from "../../components/ChapterCard";
import { useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChaptersListMutation, useGetEpisodesDetailMutation } from "../../app/api";

const Chapters = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const {episode_id} = useParams()
    
    
    const [episode, setEpisode] = React.useState(null)
    const [getEpisodeDetail] = useGetEpisodesDetailMutation()
    const getEpisodeDetailFunc= async ()=>{
        const response = await getEpisodeDetail(episode_id)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
            
        } else {
            console.log("Login Success")
            let dataObject = response.data.data;
            setEpisode(dataObject)
            await getChaptersfunc()
            // const {access_token} =  getToken()
            console.log(dataObject)
        }
    }
    
    const [data, setData] = React.useState([])
    const [apiErrors, SetApiErrors] = React.useState({})
    const [getEpisodeChapters, {isLoading}] = useGetEpisodeChaptersListMutation()

    const getChaptersfunc = async ()=>{
        const response = await getEpisodeChapters(episode_id)
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
        getEpisodeDetailFunc()
    }, [])

    return (
        <Box m="20px">
            <Header title="Chapter Selection" subtitle="List of all Chapters" />

            <Box sx={{ flexGrow: 1 }}>
                {/* {mockDataChapters.map(chapter => ( */}
                { episode != null && data.map((ch, index)=>
                    <ChapterCard 
                        key={ch.id}
                        chapter={ch.title} 
                        chapterMakerName={""} 
                        chapterTranscript={ch.content} 
                        episodeTranscript={episode.content}
                        startTime={ch.start_time}
                        endTime={ch.end_time}
                        src={"../../assets/benedwards.png"}/>
                )}
            </Box>
        </Box>
    );
}

export default Chapters;