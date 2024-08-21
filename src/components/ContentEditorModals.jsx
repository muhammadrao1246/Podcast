
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery } from "@mui/material";
import { tokens } from "src/theme";
import { useOutletContext, useParams } from "react-router-dom";
import React from "react";
import { useGetEpisodeChapterDetailMutation, useGetReelsDetailMutation, useUpdateEpisodeChapterMutation, useUpdateReelMutation } from "src/services/api";
import { ClosableToast } from "src/components/Toast";
import { secondsToTimeString } from "src/components/RangeSlider";
import { debounce } from "lodash";
import SequenceContentBox from "src/components/SequenceContentBox";

export const ChapterContentEditor = React.memo(function ChapterContentEditor({open, setOpen, episodeId, chapterId, title, startSeq, endSeq, startTime, endTime, refresher}){
    const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));



//   const handleOpen = () => setOpen(true);
  const handleClose = debounce((id) => {
        setOpen(false)
    }, 100)

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [chapterSequences, setChapterSequences] = React.useState([]);
  const editedSequences = React.useRef({});
  const deletedSequences = React.useRef(new Set())


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
  },[episodeId, chapterId])   


  const [updateChapter,] = useUpdateEpisodeChapterMutation()
  const handleSave = async (e) => {
    // all deleted sequences previous editing will not be saved
    deletedSequences.current.forEach(id=>delete editedSequences.current[id])
    let body = {
        sequences: chapterSequences.filter(seq=>!deletedSequences.current.has(seq.id)).map(seq => seq.id),
        start_sequence_number: startSeq,
        end_sequence_number: endSeq,
        edit_sequences: editedSequences.current,
        // deleted_sequences: Array.from(deletedSequences.current)
    };
    console.log(body)
    // return
    setLoading(true);
    
    requestAnimationFrame(async () => {
        const response = await updateChapter({episodeId, chapterId, body});
        
        if (!!response.error) {
            let dataObject = response.error.data;
            Object.keys(dataObject.errors).forEach((errorType) => {
                ClosableToast(dataObject.errors[errorType][0], "error", 2000);
            });
        } else {
            handleClose();
            ClosableToast("Chapter Updated Successfully!", "success", 2000);
            setTimeout(() => {
                refresher();
            }, 1000);
        }
    });
};



  const handleEdit = (id, newWords)=>{
    editedSequences.current[id] = newWords;
  }
  
  const handleDelete = React.useCallback(debounce((id) => {
        // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
        deletedSequences.current.add(id)
        console.log(`${id} Deleted: `, editedSequences.current, deletedSequences.current)
    }, 300), []);

  const handleUndoDelete = React.useCallback(debounce((id) => {
        // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
        
        deletedSequences.current.delete(id)
        console.log(`${id} UnDeleted: `, editedSequences.current, deletedSequences.current)
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
                chapterSequences.length > 0 && chapterSequences.map((seq, index)=>(
                    <SequenceContentBox 
                                key={seq.id}
                                id={seq.id}
                                index={index}
                                word={seq.id in editedSequences.current ? editedSequences.current[seq.id] : seq.words}
                                sequence_number={seq.sequence_number}
                                isDeletedInList={deletedSequences.current.has(seq.id)}
                                onUndoDelete={()=>handleUndoDelete(seq.id)}
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


export const ReelContentEditor = React.memo(function ReelContentEditor({open, setOpen, episodeId, chapterId, reelId, title, startSeq, endSeq, startTime, endTime, refresher}){
    const isNonMobile = useMediaQuery("(min-width:600px)");

  const [loading, setLoading] = useOutletContext().loader;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));



//   const handleOpen = () => setOpen(true);
  const handleClose = debounce((id) => {
        setOpen(false)
    }, 100)

  
  const [currStartTime, setStartTime] = React.useState(startTime);
  const [currEndTime, setEndTime] = React.useState(endTime);
  const [startSequence, setStartSequence] = React.useState(startSeq)
  const [endSequence, setEndSequence] = React.useState(endSeq)
  
  const [reelSequences, setReelSequences] = React.useState([]);
  const editedSequences = React.useRef({});
  const deletedSequences = React.useRef(new Set())


  const [getReelDetail,] = useGetReelsDetailMutation()
  const getReelDetailFunc = async () => {
    setLoading(true)
    const response = await getReelDetail({episodeId, chapterId, reelId})
    setLoading(false)
      if (!!response.error) {
          let dataObject = response.error.data;
          console.log(dataObject.errors);
          ClosableToast("Unable To Load Reel Data. Try Again!", "error", 2000)
          handleClose()
      } else {
          let dataObject = response.data.data;
          setReelSequences(dataObject.sequences)
      }
  }


  // fetch Chapter Details
  React.useEffect(()=>{
    getReelDetailFunc()
  },[episodeId, chapterId, reelId])   


  const [updateReel,] = useUpdateReelMutation()
  const handleSave = async (e) => {
    // all deleted sequences previous editing will not be saved
    deletedSequences.current.forEach(id=>delete editedSequences.current[id])
    let body = {
        sequences: reelSequences.filter(seq=>!deletedSequences.current.has(seq.id)).map(seq => seq.id),
        start_sequence_number: startSeq,
        end_sequence_number: endSeq,
        edit_sequences: editedSequences.current,
        // deleted_sequences: Array.from(deletedSequences.current)
    };
    console.log(body)
    // return
    setLoading(true);
    
    requestAnimationFrame(async () => {
        const response = await updateReel({episodeId, chapterId, reelId, body});
        
        if (!!response.error) {
            let dataObject = response.error.data;
            Object.keys(dataObject.errors).forEach((errorType) => {
                ClosableToast(dataObject.errors[errorType][0], "error", 2000);
            });
        } else {
            handleClose();
            ClosableToast("Reel Updated Successfully!", "success", 2000);
            setTimeout(() => {
                refresher();
            }, 1000);
        }
    });
};



  const handleEdit = (id, newWords)=>{
    editedSequences.current[id] = newWords;
  }
  
  const handleDelete = React.useCallback(debounce((id) => {
        // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
        deletedSequences.current.add(id)
        console.log(`${id} Deleted: `, editedSequences.current, deletedSequences.current)
    }, 300), []);

  const handleUndoDelete = React.useCallback(debounce((id) => {
        // setChapterSequences(prevSequences => prevSequences.filter(seq => seq.id !== id));
        
        deletedSequences.current.delete(id)
        console.log(`${id} UnDeleted: `, editedSequences.current, deletedSequences.current)
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
                reelSequences.length > 0 && reelSequences.map((seq, index)=>(
                    <SequenceContentBox 
                                key={seq.id}
                                id={seq.id}
                                index={index}
                                word={seq.id in editedSequences.current ? editedSequences.current[seq.id] : seq.words}
                                sequence_number={seq.sequence_number}
                                isDeletedInList={deletedSequences.current.has(seq.id)}
                                onUndoDelete={()=>handleUndoDelete(seq.id)}
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