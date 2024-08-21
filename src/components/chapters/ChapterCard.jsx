import * as React from 'react';
import { Typography, Button, useTheme, Box, IconButton } from "@mui/material";
import { EditOutlined, FileDownloadOutlined, ShareOutlined, OndemandVideoOutlined } from '@mui/icons-material';
import useMediaQuery from "@mui/material/useMediaQuery";
import $ from 'jquery'
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useUpdateEpisodeChapterMutation } from 'src/services/api';

import { tokens } from "src/theme";
import RangeSlider, {timeStringToSeconds, secondsToTimeString} from 'src/components/RangeSlider';

// SequenceElastic used when user expand or shrink the slider interval using chapter's current selected currStartTime and currEndTime all sequences will be filtered
function SequenceElastic(sequences, currStartTime, currEndTime) {
    return sequences
      .filter(
        (seq, index) =>
          seq.num_start_time >= currStartTime && seq.num_end_time <= currEndTime
      )
}

// All Sequences joined to form a single paragraph text
function SequenceTextJoiner(sequences) {
    return sequences
    .map((seq) => seq.words)
    .join(" ");
}


const ChapterCard = ({onEditClick, episodeId, chapterId, chapterTitle, chapterMakerName, chapterTranscript, episodeTranscript, startSeq, endSeq, startTime, endTime, src, sequences, timeStamps, min_step, refresher}) => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const [loading, setLoading] = useOutletContext().loader // progress screen control
    const navigate = useNavigate() // use navigate to a route


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    const [currStartTime, setStartTime] = React.useState(startTime); // numric value of timestamp 00:00:00:05
    const [currEndTime, setEndTime] = React.useState(endTime); // numeric value of timestamp 00:00:00:05
    const [startSequence, setStartSequence] = React.useState(startSeq) // example 1
    const [endSequence, setEndSequence] = React.useState(endSeq) // example 100
    
    // JOIN ALL CHAPTER SEQUENCES TO CREATE TEXT USING SequenceElastic (filter function on all episode sequences ) and SequenceTextJoiner
    // const [text, setText] = React.useState(SequenceTextJoiner(SequenceElastic(sequences, currStartTime, currEndTime)));

    // 
    // const handleChange = (newValue) => {
    //     console.log("In Chapter Change", newValue)
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
    //     document.getElementsByClassName(`${chapterId}-sequence-box`)[0].scrollIntoViewIfNeeded({block: "nearest", behaviour: "smooth"})
    // };

    // SCROLL TO POSITION WHERE USER MAKING CHANGE
    // React.useEffect(()=>{
    //     $(`.${chapterId}-sequence-box`).scrollTop(0)
    // },[currStartTime, chapterId])
    // React.useEffect(()=>{
    //     $(`.${chapterId}-sequence-box`).scrollTop(1000000)
    // },[currEndTime, chapterId])


    // // generate button clicked now update the chapter and all database
    // const [apiErrors, SetApiErrors] = React.useState({})
    // const [updateChapter, {isLoading}] = useUpdateEpisodeChapterMutation()
    // const handleGenerate = async (e) => {
    //     setLoading(true)
    //     let body = {
    //         start_sequence_number: startSequence,
    //         end_sequence_number: endSequence,
    //     }
    //     console.log(episodeId, chapterId, body)
    //     const response = await updateChapter({episodeId, chapterId, body})
    //     if (!!response.error) {
    //         let dataObject = response.error.data;
    //         console.log(dataObject.errors);
    //         SetApiErrors(dataObject.errors)
    //         setLoading(false)
            
    //     } else {
    //         let dataObject = response.data.data;
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


    return (
        <Box m="20px">
            <Box display="flex" alignItems="center" gap="40px">
                <Typography variant="h2">
                    {chapterTitle}
                </Typography>
                <Typography variant="h3" color={colors.greenAccent[400]}>
                    {chapterMakerName}
                </Typography>
            </Box>
            <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
            >
                <Box mt="20px" borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 3" }}>
                    <Typography  borderRadius="10px" p="20px" textAlign="justify" bgcolor={colors.grey[500]} sx={{ height: '400px', overflow: 'auto', scrollBehavior: "smooth"}} >{chapterTranscript}</Typography>
                    {/* <Typography className={`${chapterId}-sequence-box`} borderRadius="10px" p="20px" textAlign="justify" bgcolor={colors.grey[500]} sx={{ height: '400px', overflow: 'auto', scrollBehavior: "smooth"}} >{text}</Typography> */}
                    {/* <Typography borderRadius="0 0 10px 10px" p="20px" bgcolor={colors.grey[800]}>{episodeTranscript}</Typography> */}
                </Box>
                <Box mt="20px" display="flex" height="fit-content" justifyContent="space-between" flexDirection="column" p="10px" borderRadius="10px" bgcolor={colors.grey[800]} sx={{ gridColumn: "span 1" }}>
                    <img
                    alt="chapterImage"
                    width="100%"
                    src={`${src}`}
                    />
                    <Box borderRadius="10px" bgcolor={colors.grey[600]} display="flex" justifyContent="space-between" alignItems="center" p="10px" width="100%" mt="15px">
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
                <Box display="flex" justifyContent="space-between" gap="10px" alignItems="center" sx={{ gridColumn: "span 3" }}>
                    <Typography borderRadius="10px" p="15px 20px" bgcolor={colors.grey[800]} >{secondsToTimeString(currStartTime, false)}</Typography>
                    
                    {/* <RangeSlider
                        key={chapterId+'-slider'}
                        timeStamps={timeStamps}
                        handleChange={handleChange}
                        startTime={currStartTime}
                        endTime={currEndTime}
                        min_step={min_step}
                    /> */}
                    <Typography borderRadius="10px" p="15px 20px" bgcolor={colors.grey[800]} >{secondsToTimeString(currEndTime, false)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center"  gap="10px" sx={{ gridColumn: "span 1" }}>
                    {/* <Button onClick={handleReset} p="15px 20px" size="large" color='info' variant='outlined' sx={{ width: "100%", p: "15px" }}>Reset</Button>
                    <Button onClick={handleGenerate} p="15px 20px" size="large" color='secondary' variant='contained' sx={{ width: "100%", p: "15px" }}>Generate</Button> */}
                    <Button onClick={onEditClick} p="15px 20px" size="large" color='secondary' variant='contained' sx={{ width: "100%", p: "15px" }}>Edit Chapter</Button>
                </Box>
            </Box>
            
        </Box>
    );
}

export default ChapterCard; 
