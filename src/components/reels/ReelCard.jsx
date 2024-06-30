import * as React from 'react';
import { Box, Typography, Button, useTheme,IconButton, Card, CardMedia, CardContent, CardActions, Accordion, AccordionActions, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "src/theme";
import { ClosedCaptionOffOutlined, TuneOutlined, EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined, DeleteForeverOutlined, DeleteOutlineRounded, DeleteOutline, DeleteOutlineOutlined } from '@mui/icons-material';

import { useNavigate, useOutletContext } from 'react-router-dom';
import { useDeleteReelsMutation, useUpdateEpisodeChapterMutation, useUpdateReelMutation } from 'src/services/api';

import RangeSlider, {timeStringToSeconds, secondsToTimeString} from 'src/components/RangeSlider';
import $ from 'jquery'
import { ClosableToast } from 'src/components/Toast';

export function SequenceElastic(sequences, currStartTime, currEndTime) {
    console.log({sequences, currStartTime, currEndTime})
    return sequences
      .filter(
        (seq) =>
          seq.num_start_time >= currStartTime && seq.num_end_time <= currEndTime
      )
}

export function SequenceTextJoiner(sequences) {
    return sequences
    .map((seq) => seq.words)
    .join(" ");
}

const ReelCard = ({episodeId, chapterId, reelId, reelTitle, startSeq, endSeq, startTime, endTime, src, sequences, timeStamps, min_step, refresher}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    
    const [loading, setLoading] = useOutletContext().loader
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // const [inital, setInitialData] = React.useState({start});

    const [currStartTime, setStartTime] = React.useState(startTime);
    const [currEndTime, setEndTime] = React.useState(endTime);
    const [startSequence, setStartSequence] = React.useState(startSeq)
    const [endSequence, setEndSequence] = React.useState(endSeq)
    
    const [text, setText] = React.useState(SequenceTextJoiner(SequenceElastic(sequences, currStartTime, currEndTime)));

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
        document.getElementsByClassName(`${reelId}-sequence-box`)[0].scrollIntoViewIfNeeded({block: "nearest", behaviour: "smooth"})
    };

    React.useEffect(()=>{
        $(`.${reelId}-sequence-box`).scrollTop(0)
    },[currStartTime, reelId])
    React.useEffect(()=>{
        $(`.${reelId}-sequence-box`).scrollTop(1000000)
    },[currEndTime, reelId])

    // ClosableToast("Reel Edited Successfully!", "success", 2000)

    // generate button clicked now update the chapter and all database
    const [apiErrors, SetApiMessages] = React.useState({})

    const [updateReel, {isLoading}] = useUpdateReelMutation()
    const handleGenerate = async (e) => {
        setLoading(true)
        let body = {
            start_sequence_number: startSequence,
            end_sequence_number: endSequence,
        }
        console.log(episodeId, chapterId, body)
        const response = await updateReel({episodeId, chapterId, reelId, body})
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
            setLoading(false)
            
        } else {
            let dataObject = response.data.data;
            ClosableToast("Reel Edited Successfully!", "success", 2000)
            refresher()
            // navigate(`/episodes/${episodeId}/chapters`)
        }
        console.log("Generate: ", e)
    };

    

    // handle reset
    const handleReset = (e) => {
        setStartTime(startTime)
        setEndTime(endTime)
        let filteredSequences = SequenceElastic(sequences, startTime, endTime)
        setText(SequenceTextJoiner(filteredSequences))
        setStartSequence(startSeq)
        setEndSequence(endSeq)
    };

    // handle delete
    const [deleteReel, {isDeleteLoading}] = useDeleteReelsMutation()
    const handleDelete = async (e) => {
        // setLoading(true)
        const response = await deleteReel({episodeId, chapterId, reelId})
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
            // setLoading(false)
            
        } else {
            let dataObject = response.data.data;
            ClosableToast("Reel Deleted Successfully!", "success", 2000)
            refresher()
            // navigate(`/episodes/${episodeId}/chapters`)
        }
    };

    return (
      <Box m="20px" >
        <Box display="flex" alignItems="center" justifyContent={"space-between"} gap="40px">
          <Typography variant="h4">{reelTitle}</Typography>
          <Button onClick={handleDelete} size="medium" variant="outlined" color="error">
                Delete Reel 
          </Button>
        </Box>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <Box
            mt="20px"
            borderRadius="10px"
            bgcolor={colors.grey[800]}
            sx={{ gridColumn: "span 3" }}
          >
            <Typography
              className={`${reelId}-sequence-box`}
              borderRadius="10px"
              p="20px"
              textAlign="justify"
              bgcolor={colors.grey[800]}
              color={colors.grey[0]}
              sx={{
                height: "400px",
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
            height="fit-content"
            justifyContent="space-between"
            flexDirection="column"
            p="10px"
            borderRadius="10px"
            bgcolor={colors.grey[800]}
            sx={{ gridColumn: "span 1" }}
          >
            <img alt="reelImage" width="100%" src={src} />
            <Box
              borderRadius="10px"
              bgcolor={colors.grey[600]}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p="10px"
              width="100%"
              mt="15px"
            >
              <IconButton>
                <ShareOutlined />
              </IconButton>
              <IconButton>
                <OndemandVideoOutlined />
              </IconButton>
              <IconButton>
                <FileDownloadOutlined />
              </IconButton>
              <IconButton>
                <EditOutlined />
              </IconButton>
            </Box>
          </Box>
          <Box
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
            <RangeSlider
              key={reelId + "-slider"}
              timeStamps={timeStamps}
              handleChange={handleChange}
              startTime={currStartTime}
              endTime={currEndTime}
              min_step={min_step}
            />
            <Typography
              borderRadius="10px"
              p="15px 20px"
              bgcolor={colors.grey[800]}
            >
              {secondsToTimeString(currEndTime, false)}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap="10px"
            sx={{ gridColumn: "span 1" }}
          >
            <Button
              onClick={handleReset}
              p="15px 20px"
              size="large"
              color="info"
              variant="outlined"
              sx={{ width: "100%", p: "15px" }}
            >
              Reset
            </Button>
            <Button
              onClick={handleGenerate}
              p="15px 20px"
              size="large"
              color="secondary"
              variant="contained"
              sx={{ width: "100%", p: "15px" }}
            >
              Generate
            </Button>
          </Box>
        </Box>
      </Box>
    );
}

export default ReelCard; 
