import * as React from 'react';
import { Box, Typography, Button, useTheme,IconButton, Card, CardMedia, CardContent, CardActions, Accordion, AccordionActions, AccordionSummary, AccordionDetails, LinearProgress, CircularProgress, Divider, Modal, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "src/theme";
import { ClosedCaptionOffOutlined, TuneOutlined, EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined, AddCircleOutlineRounded } from '@mui/icons-material';


// import { useOutletContext, useParams } from "react-router-dom";

import RangeSlider, {timeStringToSeconds, secondsToTimeString} from 'src/components/RangeSlider';

import { useAddReelMutation, useGetEpisodeChapterDetailMutation, useGetReelsListMutation } from "src/services/api";
import ReelCard, { SequenceElastic, SequenceTextJoiner } from './ReelCard';
import { useOutletContext } from 'react-router-dom';
import $ from 'jquery'
import { ClosableToast } from '../Toast';
import { ReelContentEditor } from '../ContentEditorModals';
import { ButtonFilledOutlinedStyles } from 'src/utils/utils';

const ChapterReelsComponent = ({episodeId, chapterId, chapterTitle}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const [loading, setLoading] = useOutletContext().loader

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    console.log(episodeId, chapterId)

    // getting the chapter details which is loaded as list
    const [chapter, setChapter] = React.useState(null)
    const [getChapterDetail, {isLoading}] = useGetEpisodeChapterDetailMutation()
    const getChapterDetailFunc = async ()=>{
        setLoading(true)
        const response = await getChapterDetail({episodeId, chapterId})
        setLoading(false)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
            
        } else {
            console.log("Success")
            let dataObject = response.data.data;
            setChapter(dataObject)
            await getReelfunc()
            // const {access_token} =  getToken()
            console.log(dataObject)
        }
    }

    // getting all reels list under the chapter
    const [reels, setReels] = React.useState([])
    const [apiErrors, SetApiErrors] = React.useState({})
    const [getReel, {isReelLoading}] = useGetReelsListMutation()

    const getReelfunc = async ()=>{
        const response = await getReel({episodeId, chapterId})
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
        } else {
            let dataObject = response.data.data;
            setReels(dataObject.results)
            console.log(dataObject)
        }
    }

    // ADD MODAL
    const [addModal, setAddModal] = React.useState(false)

    
    // Modal state
    const [openEditor, setOpenEditor] = React.useState(false);
    const [selectedReel, setSelectedReel] = React.useState(null);

    
    // if a reel updated do a refresh
    const [refreshNeeded, setRefreshNeeded] = React.useState(0)
    React.useEffect(()=>{
        if(refreshNeeded == 0) return;
        // window.scrollTo({behavior: "smooth", top: 0})
        setSelectedReel(null);
        getChapterDetailFunc()
    }, [refreshNeeded])

    const handleEditClick = (reel) => {
        setSelectedReel(reel);
        setOpenEditor(true);
    };
    
    // if dropdown expanded then fetch the chapter details and then reels details on wards
    const handleAccordion = (e)=>{
        if(chapter == null){
            getChapterDetailFunc()
        }
    }

    
    return (
        <div>
            <Accordion sx={{
              backgroundColor: colors.grey[900],
              border: `1px solid ${colors.grey[400]}`
            }} onChange={(handleAccordion)}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  fontSize: "16px"
                }}
                >
                    {chapterTitle}
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                        sx={{
                            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                        }}
                    >
                        <Box borderRadius="10px" sx={{ gridColumn: "span 3" }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Button size="large" color='secondary' variant='contained' 
                                startIcon={<ClosedCaptionOffOutlined />}
                                
            sx={{
              ...ButtonFilledOutlinedStyles(colors.greenAccent[400], colors.grey[900], false)
            }}
            >Caption</Button>
                                <Button size="large" color='secondary' variant='contained' startIcon={<TuneOutlined />}
                                sx={{
                                  ...ButtonFilledOutlinedStyles(colors.greenAccent[400], colors.grey[900], false)
                                }}
                                >Design</Button>
                            </Box>
                        </Box>
                        <Box borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 4", border: `1px solid ${colors.grey[400]}` }}>
                        { chapter != null && reels.map((reel, index)=>
                            <React.Fragment key={reel.id+reel.start_sequence_number.toString()+reel.end_sequence_number.toString()}>
                              <ReelCard 
                                  episodeId={reel.episode_id}
                                  chapterId={reel.chapter_id}
                                  reelId={reel.id}
                                  reelTitle={reel.title} 
                                  reelTranscript={reel.content}
                                  startTime={reel.num_start_time}
                                  endTime={reel.num_end_time}
                                  startSeq={reel.start_sequence_number}
                                  endSeq={reel.end_sequence_number}
                                  src={"/images/benedwards.png"}
                                  sequences={chapter.sequences}
                                  timeStamps={chapter.sliderData}
                                  min_step={chapter.min_difference}
                                  refresher={()=>setRefreshNeeded(refreshNeeded+1)}
                                  onEditClick={()=>handleEditClick(reel)}
                              />
                              {index < reels.length - 1 && <Divider />}
                          </React.Fragment>
                        )}
                        
                        </Box>
                        <Box sx={{ gridColumn: "span 4" }} display={"flex"} justifyContent={"center"}>
                            {
                                isReelLoading || isLoading ? (
                                    <CircularProgress
                                        color="secondary"
                                        sx={{
                                        height: "10px",
                                        borderRadius: "5px",
                                        gridColumn: "span 3",
                                        }}
                                    />
                                ):(
                                    <IconButton onClick={()=>setAddModal(true)}>
                                        <AddCircleOutlineRounded  sx={{width: "50px", height: "50px", color: colors.grey[400]}} />
                                    </IconButton>
                                )
                            }
                        </Box>
                        {
                            chapter != null && (
                                <AddReelComponent
                                    key={chapterId+"-"+chapter.end_sequence_number.toString()} 
                                    open={addModal}
                                    setOpen={setAddModal}
                                    episodeId={episodeId}
                                    chapterId={chapterId}

                                    
                                    startTime={chapter.num_start_time}
                                    endTime={chapter.num_end_time}
                                    startSeq={chapter.start_sequence_number}
                                    endSeq={chapter.end_sequence_number}
                                    
                                    sequences={chapter.sequences}
                                    timeStamps={chapter.sliderData}
                                    min_step={chapter.min_difference}
                                    refresher={()=>setRefreshNeeded(refreshNeeded+1)}
                                />
                            )
                        }
                        {selectedReel && (
                            <ReelContentEditor
                                key={episodeId+chapterId+selectedReel.id+"-content-editor"}
                                open={openEditor}
                                setOpen={setOpenEditor}
                                episodeId={selectedReel.episode_id}
                                chapterId={selectedReel.chapter_id}
                                reelId={selectedReel.id}
                                title={selectedReel.title}
                                startSeq={selectedReel.start_sequence_number}
                                endSeq={selectedReel.end_sequence_number}
                                startTime={selectedReel.num_start_time}
                                endTime={selectedReel.num_end_time}
                                refresher={() => setRefreshNeeded(refreshNeeded + 1)}
                            />
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}




function AddReelComponent({ open, setOpen, episodeId, chapterId, startSeq, endSeq, startTime, endTime, sequences, timeStamps, min_step, refresher }) {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));


//   const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [text, setText] = React.useState(SequenceTextJoiner(SequenceElastic(sequences, currStartTime, currEndTime)));

  
  React.useEffect(()=>{
    $(`.${chapterId}-add-sequence-box`).scrollTop(0)
    },[currStartTime])
    React.useEffect(()=>{
        $(`.${chapterId}-add-sequence-box`).scrollTop(1000000)
    },[currEndTime])

  const handleChange = (newValue) => {
      console.log("In Reel Change", newValue)
      setStartTime(newValue[0]);
      setEndTime(newValue[1])
      let filteredSequences = SequenceElastic(sequences, currStartTime, currEndTime)
      
      if (filteredSequences.length > 0) {
          setStartSequence(filteredSequences[0].sequence_number)
          setEndSequence(filteredSequences[filteredSequences.length - 1].sequence_number)
      } else {
          setStartSequence(0)
          setEndSequence(0)
      }

      setText(SequenceTextJoiner(filteredSequences))
  };


  const [apiErrors, SetApiMessages] = React.useState({})
  const [addReel, {isLoading}] = useAddReelMutation()
  const handleGenerate = async (e) => {
      setLoading(true)
      let body = {
          start_sequence_number: startSequence,
          end_sequence_number: endSequence,
      }
      console.log(episodeId, chapterId, body)
      const response = await addReel({episodeId, chapterId, body})
      setLoading(false)
      if (!!response.error) {
          let dataObject = response.error.data;
          console.log(dataObject.errors);
          
          SetApiMessages(
              Object.keys(dataObject.errors).map((errorType, index) => {
                
                ClosableToast(dataObject.errors[errorType][0], "error", 2000)
                return {
                  type: errorType,
                  message: dataObject.errors[errorType],
                };
              })
            );
            
      } else {
          let dataObject = response.data.data;
          ClosableToast("Reel Added Successfully!", "success", 2000)
          setOpen(false)
          refresher()
          // navigate(`/episodes/${episodeId}/chapters`)
      }
      console.log("Generate: ", e)
  };


  return (
    <Dialog maxWidth="md" open={open} fullWidth={true} onClose={handleClose}>
      <DialogTitle>Add New Reel</DialogTitle>
      <DialogContent>
        <Box
        //   mt="20px"
          borderRadius="10px"
          bgcolor={colors.grey[800]}
          sx={{ gridColumn: "span 3" }}
        >
          <Typography
            className={`${chapterId}-add-sequence-box`}
            borderRadius="10px"
            p="20px"
            textAlign="justify"
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
            sx={{
              height: "300px",
              overflow: "auto",
              scrollBehavior: "smooth",
            }}
          >
            {text}
          </Typography>
          {/* <Typography borderRadius="0 0 10px 10px" p="20px" bgcolor={colors.grey[800]}>{episodeTranscript}</Typography> */}
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
            
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currStartTime, false)}
          </Typography>
          <RangeSlider
            key={chapterId + "-add-reel-slider"}
            timeStamps={timeStamps}
            handleChange={handleChange}
            isDisabled={false}
            startTime={currStartTime}
            endTime={currEndTime}
            min_step={min_step}
          />
          <Typography
            borderRadius="10px"
            p="15px 20px"
            
          bgcolor={colors.grey[600]}
          color="#e0e0e0"
          >
            {secondsToTimeString(currEndTime, false)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
              size="large"
              color="info"
              variant="outlined"
              onClick={handleClose}>Cancel</Button>
        <Button
              size="large"
              color="secondary"
              variant="contained"
            sx={{
              ...ButtonFilledOutlinedStyles(colors.greenAccent[400], colors.grey[900], false)
            }}
              onClick={handleGenerate}>Generate Reel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChapterReelsComponent; 
