import * as React from 'react';
import { Box, Typography, Button, useTheme,IconButton, } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "src/theme";
import { EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined,  } from '@mui/icons-material';

import { useNavigate, useOutletContext } from 'react-router-dom';
import { useDeleteReelsMutation, useUpdateEpisodeChapterMutation, useUpdateReelMutation } from 'src/services/api';

import RangeSlider, {timeStringToSeconds, secondsToTimeString} from 'src/components/RangeSlider';
import $ from 'jquery'
import { ClosableToast } from 'src/components/Toast';
import { ButtonFilledOutlinedStyles, DropboxSharedToDownloadableConverter } from 'src/utils/utils';

import MUIPlayer from '../MUIPlayer';

const ReelCard = ({onEditClick, videoLink, episodeId, chapterId, reelId, reelTitle, reelTranscript, startSeq, endSeq, startTimeStamp, endTimeStamp, startTime, endTime, src, sequences, timeStamps, min_step, refresher}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    
    const [loading, setLoading] = useOutletContext().loader
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // const [inital, setInitialData] = React.useState({start});

    const [currStartTime, setStartTime] = React.useState(startTime);
    const [currEndTime, setEndTime] = React.useState(endTime);
    const [startSequence, setStartSequence] = React.useState(startSeq)
    const [endSequence, setEndSequence] = React.useState(endSeq)
    

    // const [text, setText] = React.useState(SequenceTextJoiner(SequenceElastic(sequences, currStartTime, currEndTime)));

    // const handleChange = (newValue) => {
    //     console.log("In Reel Change", newValue)
    //     setStartTime(newValue[0]);
    //     setEndTime(newValue[1])
    //     let filteredSequences = SequenceElastic(sequences, currStartTime, currEndTime)
        
    //     if (filteredSequences.length > 0) {
    //         setStartSequence(filteredSequences[0].sequence_number)
    //         setEndSequence(filteredSequences[filteredSequences.length - 1].sequence_number)
    //     } else {
    //         setStartSequence(0)
    //         setEndSequence(0)
    //     }

    //     setText(SequenceTextJoiner(filteredSequences))
    //     document.getElementsByClassName(`${reelId}-sequence-box`)[0].scrollIntoViewIfNeeded({block: "nearest", behaviour: "smooth"})
    // };

    // React.useEffect(()=>{
    //     $(`.${reelId}-sequence-box`).scrollTop(0)
    // },[currStartTime, reelId])
    // React.useEffect(()=>{
    //     $(`.${reelId}-sequence-box`).scrollTop(1000000)
    // },[currEndTime, reelId])

    // ClosableToast("Reel Edited Successfully!", "success", 2000)

    // generate button clicked now update the chapter and all database
    const [apiErrors, SetApiMessages] = React.useState({})

    // const [updateReel, {isLoading}] = useUpdateReelMutation()
    // const handleGenerate = async (e) => {
    //     setLoading(true)
    //     let body = {
    //         start_sequence_number: startSequence,
    //         end_sequence_number: endSequence,
    //     }
    //     console.log(episodeId, chapterId, body)
    //     const response = await updateReel({episodeId, chapterId, reelId, body})
    //     if (!!response.error) {
    //         let dataObject = response.error.data;
    //         console.log(dataObject.errors);
            
    //         SetApiMessages(
    //             Object.keys(dataObject.errors).map((errorType, index) => {
                  
    //               ClosableToast(dataObject.errors[errorType][0], "error", 2000)
    //               return {
    //                 type: errorType,
    //                 message: dataObject.errors[errorType],
    //               };
    //             })
    //           );
    //         setLoading(false)
            
    //     } else {
    //         let dataObject = response.data.data;
    //         ClosableToast("Reel Edited Successfully!", "success", 2000)
    //         refresher()
    //         // navigate(`/episodes/${episodeId}/chapters`)
    //     }
    //     console.log("Generate: ", e)
    // };

    

    // // handle reset
    // const handleReset = (e) => {
    //     setStartTime(startTime)
    //     setEndTime(endTime)
    //     let filteredSequences = SequenceElastic(sequences, startTime, endTime)
    //     setText(SequenceTextJoiner(filteredSequences))
    //     setStartSequence(startSeq)
    //     setEndSequence(endSeq)
    // };

    // handle delete
    const [deleteReel, {isDeleteLoading}] = useDeleteReelsMutation()
    const handleDelete = async (e) => {
        setLoading(true)
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
      <Box m="20px">
        <Box
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          gap="40px"
        >
          <Typography variant="h4">{reelTitle}</Typography>
          <Button
            onClick={handleDelete}
            size="medium"
            variant="contained"
            color="error"
            sx={{
              ...ButtonFilledOutlinedStyles(
                colors.redAccent[400],
                colors.grey[900],
                false
              ),
            }}
          >
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
          <Box mt="20px" borderRadius="10px" sx={{ gridColumn: "span 3" }}>
            <Typography
              borderRadius="10px"
              p="20px"
              textAlign="justify"
              bgcolor={colors.grey[600]}
              color={"#e0e0e0"}
              sx={{
                height: "400px",
                overflow: "auto",
                scrollBehavior: "smooth",
                border: `1px solid ${colors.grey[300]}`,
                fontSize: "1.2em",
                wordSpacing: "5px",
              }}
            >
              {reelTranscript}
            </Typography>
            {/* <Typography
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
            </Typography> */}
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
            bgcolor={colors.grey[600]}
            sx={{
              gridColumn: "span 1",
              border: `1px solid ${colors.grey[300]}`,
              
            }}
          >
            {/* <img alt="chapterImage" width="100%" src={`${src}`} /> */}
            {/* <video controls width={"100%"} height={"100%"} crossOrigin="anonymous" src="https://dl.dropboxusercontent.com/s/3sotdlsh65220732ig3qc/Final-Main-Ep-MultiCam1.mp4?rlkey=d66buj1tyuhkylf3ldb0k7cs0&e=1&st=6ftvtxhe&bmus=1&dl=0"></video> */}
            {/* <ReactPlayer
              controls
              stopOnUnmount={true}
              onBufferEnd={(e)=>console.log(e)}
              width="100%"
              height="100%"
              url={DropboxSharedToDownloadableConverter(
                "https://www.dropbox.com/scl/fi/3sotdlsh65220732ig3qc/Final-Main-Ep-MultiCam1.mp4?rlkey=d66buj1tyuhkylf3ldb0k7cs0&e=1&st=6ftvtxhe&bmus=1&dl=0"
              )}
            /> */}
            <MUIPlayer
              key={reelId}
              startTime={startTime}
              endTime={endTime}
              src={DropboxSharedToDownloadableConverter(
                `${videoLink}#t=${parseInt(startTime)},${parseInt(endTime)}`
              )}
            />
            <Box
              borderRadius="10px"
              bgcolor={colors.grey[400]}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p="10px"
              width="100%"
              mt="15px"
            >
              <IconButton>
                <ShareOutlined sx={{ color: "#e0e0e0" }} />
              </IconButton>
              <IconButton>
                <OndemandVideoOutlined sx={{ color: "#e0e0e0" }} />
              </IconButton>
              <IconButton>
                <FileDownloadOutlined sx={{ color: "#e0e0e0" }} />
              </IconButton>
              <IconButton>
                <EditOutlined sx={{ color: "#e0e0e0" }} />
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
              bgcolor={colors.grey[600]}
              color="#e0e0e0"
              sx={{ border: `1px solid ${colors.grey[300]}` }}
            >
              {secondsToTimeString(currStartTime, false)}
            </Typography>
            <RangeSlider
              key={reelId + "-slider"}
              timeStamps={timeStamps}
              // handleChange={handleChange}
              handleChange={(value) => value}
              isDisabled={true}
              startTime={currStartTime}
              endTime={currEndTime}
              min_step={min_step}
            />
            <Typography
              borderRadius="10px"
              p="15px 20px"
              bgcolor={colors.grey[600]}
              color="#e0e0e0"
              sx={{ border: `1px solid ${colors.grey[300]}` }}
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
              onClick={onEditClick}
              p="15px 20px"
              size="large"
              color="secondary"
              variant="contained"
              sx={{
                width: "100%",
                p: "15px",
                ...ButtonFilledOutlinedStyles(
                  colors.grey[100],
                  colors.grey[900]
                ),
              }}
            >
              Edit Reel
            </Button>
            {/* <Button
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
            </Button> */}
          </Box>
        </Box>
      </Box>
    );
}

export default ReelCard; 
