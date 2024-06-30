import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "src/theme";
import Header from "src/components/Layouts/Header/Header";
import { mockDataChapters } from "src/data/mockData";
import ReelCard from "src/components/reels/ReelCard";

import { useOutletContext, useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChaptersListMutation } from "src/services/api";
import ChapterReelsComponent from "src/components/reels/ChapterReelsComponent";
// import { C } from "@fullcalendar/core/internal-common";

const Reels = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useOutletContext().loader

    const {episode_id} = useParams()
    
    const [data, setData] = React.useState([])
    const [apiErrors, SetApiErrors] = React.useState({})
    const [getEpisodeChapters, {isLoading}] = useGetEpisodeChaptersListMutation()

    const getChaptersListfunc = async ()=>{
        setLoading(true)
        const response = await getEpisodeChapters(episode_id)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
        } else {
            let dataObject = response.data.data;
            setData(dataObject.results)
            console.log(dataObject)

        }
        setLoading(false)
    }

    React.useEffect(()=>{
        getChaptersListfunc()
    },[])

    console.log("Data: ",data)
    return (
        <Box m="20px">
            <Header title="Reel Maker" subtitle="List of all Reels" />

            <Box sx={{ flexGrow: 1 }}>
                {
                    data.map(ch => (
                        <ChapterReelsComponent 
                            key={ch.id+"-accord"}
                            episodeId={episode_id}
                            chapterId={ch.id}
                            chapterTitle={ch.title}
                        />
                    ))
                }
                {/* {mockDataChapters.map(chapter => (
                    <ReelCard 
                        key={chapter.id}
                        chapter={chapter.chapter} 
                        chapterMakerName={chapter.chapterMakerName} 
                        chapterTranscript={chapter.chapterTranscript} 
                        episodeTranscript={chapter.episodeTranscript}
                        startTime={chapter.startTime}
                        endTime={chapter.endTime}
                        src={chapter.src}/>
                ))} */}
            </Box>
        </Box>
    );
}



export default Reels;