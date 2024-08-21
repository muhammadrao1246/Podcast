
import React from "react";
import { Typography, useTheme, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { tokens } from "src/theme";

import EditSequencePopover from "src/components/EditSequencePopover";
import { DeleteForeverOutlined, EditNoteOutlined } from "@mui/icons-material";

const SequenceContentBox = React.memo(function SequenceContentBox({id, sequence_number, word, onEdit, onDelete}){
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
  
  //  anchor popover element
    const [words, setWords] = React.useState(word)
    const anchorEl = React.useRef(null);
  
    const [contextMenu, setContextMenu] = React.useState(null);
    const handleContextMenu = (event) => {
      anchorEl.current = event.target
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
      );
    };
    const handleContextMenuClose = () => {
      setContextMenu(null);
    };
  
  
    
      const [popOpen, setPopOpen] = React.useState(false)
      const handleSubmit = async (values) => {
          console.log(values)
          onEdit(id, values.words)
          setPopOpen(false)
          setWords(values.words)
      }
    
      
      return (
          <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
              <Typography
                  // textAlign="justify"
                  color={colors.grey[0]}
                  sx={{
                      "&:hover": {
                          color: colors.grey[400]
                      }
                  }}
              >
                  {words}
              </Typography>
              <Menu
                  open={contextMenu !== null}
                  onClose={handleContextMenuClose}
                  anchorReference="anchorPosition"
                  anchorPosition={
                  contextMenu !== null
                      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                      : undefined
                  }
              >
                  <MenuItem onClick={()=>{handleContextMenuClose();setPopOpen(true);}}>
                      <ListItemIcon>
                          <EditNoteOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={()=>{handleContextMenuClose();onDelete();}}>
                      <ListItemIcon>
                          <DeleteForeverOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                  </MenuItem>
              </Menu>
              <EditSequencePopover 
                  popOpen={popOpen}
                  setPopOpen={setPopOpen}
                  word={word}
                  handleSubmit={handleSubmit}
                  target={anchorEl.current}
              />
          </div>
      )
  })

export default SequenceContentBox;