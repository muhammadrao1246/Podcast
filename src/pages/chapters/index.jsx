
import { Box, useTheme } from "@mui/material";
import { tokens } from "src/theme";
import Header from "src/components/Layouts/Header/Header";
import ChapterCard from "src/components/chapters/ChapterCard";
import { useOutletContext, useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChaptersListMutation, useGetEpisodesDetailMutation } from "src/services/api";
import { ChapterContentEditor } from "src/components/ContentEditorModals";

const Chapters = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [loading, setLoading] = useOutletContext().loader

    const {episode_id} = useParams()


    // Modal state
    const [openEditor, setOpenEditor] = React.useState(false);
    const [selectedChapter, setSelectedChapter] = React.useState(null);
    
    
    const [episode, setEpisode] = React.useState(null)
    const [getEpisodeDetail] = useGetEpisodesDetailMutation()
    const getEpisodeDetailFunc = async ()=>{
        setLoading(true)
        const response = await getEpisodeDetail(episode_id)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
            
        } else {
            console.log("Login Success")
            let dataObject = response.data.data;
            // sequences = CreateSliderMarkersWithEpisodeSequences(dataObject.sequences)
            setEpisode(dataObject)
            await getChaptersfunc()
            // const {access_token} =  getToken()
            console.log(dataObject)
        }
        setLoading(false)
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
            let dataObject = response.data.data;
            setData(dataObject.results)
            console.log(dataObject)
        }
    }


    const handleEditClick = (chapter) => {
        setSelectedChapter(chapter);
        setOpenEditor(true);
    };

    
    const [refreshNeeded, setRefreshNeeded] = React.useState(0)
    React.useEffect(()=>{
        window.scrollTo({behavior: "smooth", top: 0})
        setSelectedChapter(null);
        getEpisodeDetailFunc()
    }, [refreshNeeded])

    return (
        <Box m="20px">
            <Header title="Chapter Selection" subtitle="List of all Chapters" />

            <Box sx={{ flexGrow: 1 }}>
                {/* {mockDataChapters.map(chapter => ( */}
                { episode != null && data.map((ch, index)=>
                    <ChapterCard 
                        key={ch.id+ch.start_sequence_number+ch.end_sequence_number}
                        episodeId={ch.episode_id}
                        chapterId={ch.id}
                        chapterTitle={ch.title} 
                        chapterMakerName={""} 
                        chapterTranscript={ch.content} 
                        episodeTranscript={episode.content}
                        startTimeStamp = {ch.start_time}
                        endTimeStamp = {ch.end_time}
                        startTime={ch.num_start_time}
                        endTime={ch.num_end_time}
                        videoLink={episode.video_link}
                        src={"/images/benedwards.png"}
                        startSeq={ch.start_sequence_number}
                        endSeq={ch.end_sequence_number}
                        sequences={episode.sequences}
                        timeStamps={episode.sliderData}
                        min_step={episode.min_difference}
                        refresher={()=>setRefreshNeeded(refreshNeeded+1)}
                        onEditClick={()=>handleEditClick(ch)}
                    />
                )}
            </Box>
            {selectedChapter && (
                <ChapterContentEditor
                    key={episode.id+selectedChapter.id}
                    open={openEditor}
                    setOpen={setOpenEditor}
                    episodeId={selectedChapter.episode_id}
                    chapterId={selectedChapter.id}
                    title={selectedChapter.title}
                    startSeq={selectedChapter.start_sequence_number}
                    endSeq={selectedChapter.end_sequence_number}
                    startTime={selectedChapter.num_start_time}
                    endTime={selectedChapter.num_end_time}
                    refresher={() => setRefreshNeeded(refreshNeeded + 1)}
                />
            )}
        </Box>
    );
}




export default Chapters;