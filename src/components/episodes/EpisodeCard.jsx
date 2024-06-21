import * as React from "react";
import {
  Typography,
  Button,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  IconButton,
} from "@mui/material";
import { tokens } from "src/theme";
import { DeleteOutlineOutlined } from "@mui/icons-material";
import { useDeleteEpisodesMutation } from "src/services/api";

import { Link as DOMLink, useOutletContext } from "react-router-dom";

const EpisodeCard = ({ id, image, title, content, start_time, end_time, refresher }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [loading, setLoading] = useOutletContext().loader
  
    // generate button clicked now update the chapter and all database
    const [apiErrors, SetApiErrors] = React.useState({})
    const [deleteEpisode, {isLoading}] = useDeleteEpisodesMutation()
    const handleDelete = async (e) => {
        const response = await deleteEpisode(id)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
        } else {
            let dataObject = response.data.data;
            refresher()
            // navigate(`/episodes/${episodeId}/chapters`)
        }
        console.log("Delete Episode: ", title)
    };

  return (
    <Card sx={{ gridColumn: "span 2" }}>
      <CardMedia
        sx={{
          height: 140,
          backgroundColor: `${colors.primary[400]} !important`,
        }}
        image={`/images/episode.png`}
        title="green iguana"
      />
      <CardContent
        sx={{ backgroundColor: `${colors.primary[400]} !important` }}
      >
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          color={colors.greenAccent[300]}
        >
          {title}
        </Typography>
        <Typography variant="body" color={colors.grey[100]}>
          {content}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          backgroundColor: `${colors.primary[400]} !important`,
          p: "15px",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" gap="10px">
          <Button
            size="small"
            color="secondary"
            variant="contained"
            LinkComponent={DOMLink}
            to={`/episodes/${id}/chapters`}
          >
            Chapters
          </Button>
          <Button
            size="small"
            color="secondary"
            variant="contained"
            LinkComponent={DOMLink}
            to={`/episodes/${id}/reels`}
          >
            Reels
          </Button>
        </Box>
        <IconButton>
          <DeleteOutlineOutlined onClick={handleDelete} />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default EpisodeCard;
