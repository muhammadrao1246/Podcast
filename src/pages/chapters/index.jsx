
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { tokens } from "src/theme";
import Header from "src/components/Layouts/Header/Header";
import { mockDataChapters } from "src/data/mockData";
import ChapterCard from "src/components/chapters/ChapterCard";
import { useOutletContext, useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChapterDetailMutation, useGetEpisodeChaptersListMutation, useGetEpisodesDetailMutation, useUpdateEpisodeChapterMutation } from "src/services/api";
import { ClosableToast } from "src/components/Toast";
import { secondsToTimeString } from "src/components/RangeSlider";
import { debounce } from "lodash";
import SequenceContentBox from "src/components/SequenceContentBox";


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
                        startTime={ch.num_start_time}
                        endTime={ch.num_end_time}
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


const ChapterContentEditor = React.memo(function ChapterContentEditor({open, setOpen, episodeId, chapterId, title, startSeq, endSeq, startTime, endTime, refresher}){
    const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));



//   const handleOpen = () => setOpen(true);
  const handleClose = debounce((id) => {
        setOpen(false)
    }, 300)

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [chapterSequences, setChapterSequences] = React.useState([]);
  const editedSequences = React.useRef({});


  const [getChapterDetail,] = useGetEpisodeChapterDetailMutation()
  const getChapterDetailFunc = async () => {
    setLoading(true)
    const response = await getChapterDetail({episodeId, chapterId})
    setLoading(false)
      if (!!response.error) {
          let dataObject = response.error.data;
          console.log(dataObject.errors);
          ClosableToast("Unable To Load Chapter Data. Try Again!", "error", 2000)
          handleClose()
      } else {
          let dataObject = response.data.data;
          setChapterSequences(dataObject.sequences)
      }
  }


  // fetch Chapter Details
  React.useEffect(()=>{
    getChapterDetailFunc()
  },[])   


  const [updateChapter,] = useUpdateEpisodeChapterMutation()
  const handleSave = async (e) => {
    let body = {
        sequences: chapterSequences.map(seq => seq.id),
        start_sequence_number: startSeq,
        end_sequence_number: endSeq,
        edit_sequences: editedSequences.current,
    };
    
    setLoading(true);
    
    requestAnimationFrame(async () => {
        const response = await updateChapter({episodeId, chapterId, body});
        
        if (!!response.error) {
            let dataObject = response.error.data;
            Object.keys(dataObject.errors).forEach((errorType) => {
                ClosableToast(dataObject.errors[errorType][0], "error", 2000);
            });
        } else {
            ClosableToast("Chapter Updated Successfully!", "success", 2000);
            setTimeout(() => {
                handleClose();
                refresher();
            }, 100);
        }
    });
};



  const handleEdit = (id, newWords)=>{
    editedSequences.current[id] = newWords;
  }
  
  const handleDelete = React.useCallback(debounce((id) => {
        setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
    }, 300), []);

  return (
    <Dialog maxWidth="md" open={open} fullWidth={true} onClose={handleClose}>
      <DialogTitle>Edit {title}</DialogTitle>
      <DialogContent>
        <Box
        //   mt="20px"
          borderRadius="10px"
          bgcolor={colors.grey[800]}
            p="20px"
        //   sx={{ gridColumn: "span 3" }}
          className={`${chapterId}-edit-sequence-box`}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "5px",
            height: "300px",
            overflow: "auto",
            scrollBehavior: "smooth",
          }}
        >
            {
                chapterSequences.map((seq, index)=>(
                    <SequenceContentBox 
                                key={seq.id}
                                id={seq.id}
                                index={index}
                                word={seq.id in editedSequences.current ? editedSequences.current[seq.id] : seq.words}
                                sequence_number={seq.sequence_number}
                                onEdit={handleEdit}
                                onDelete={()=>handleDelete(seq.id)}
                            />
                ))
            }
        </Box>
        <Box
          mt="20px"
          display="flex"
          justifyContent="space-between"
          gap="10px"
          alignItems="center"
          sx={{ gridColumn: "span 3" }}
        >
          <Typography
            borderRadius="10px"
            p="15px 20px"
            bgcolor={colors.grey[800]}
          >
            {secondsToTimeString(currStartTime, false)}
          </Typography>
          {/* <RangeSlider
            key={chapterId + "-add-reel-slider"}
            timeStamps={timeStamps}
            handleChange={handleChange}
            startTime={currStartTime}
            endTime={currEndTime}
            min_step={min_step}
          /> */}
          <Typography
            borderRadius="10px"
            p="15px 20px"
            bgcolor={colors.grey[800]}
          >
            {secondsToTimeString(currEndTime, false)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
              size="large"
              color="info"
              variant="text"
              onClick={handleClose}>Cancel</Button>
        <Button
              size="large"
              color="secondary"
              variant="contained"
              onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
})

export default Chapters;