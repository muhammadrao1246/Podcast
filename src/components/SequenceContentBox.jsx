
import React from "react";
import { Typography, useTheme, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { tokens } from "src/theme";

import EditSequencePopover from "src/components/EditSequencePopover";
import { DeleteForeverOutlined, EditNoteOutlined } from "@mui/icons-material";

const SequenceContentBox = React.memo(function SequenceContentBox({id, sequence_number, word, onEdit, onDelete, onUndoDelete, isDeletedInList}){
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
  
  //  anchor popover element
  const [isDeleted, setIsDeleted] = React.useState(isDeletedInList)
  
    const [words, setWords] = React.useState(word)
    const anchorEl = React.useRef(null);
  
    const [contextMenu, setContextMenu] = React.useState(null);
    const handleContextMenu = (event) => {
      if(isDeleted) return;
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
          if(values.words != words){
            onEdit(id, values.words)
            setWords(values.words)
          }
          setPopOpen(false)
      }


      const unDelete = ()=>{
        if (isDeleted){
            setIsDeleted(false)
            onUndoDelete(id)
        }
      }
    
      let note = "\nNote: Edited Deleted Sequences would not be updated on Save."
      return (
          <div onContextMenu={handleContextMenu} onClick={unDelete} title={isDeleted ?  "Click to Undo Delete" : "Right Click to Open Menu"} style={{ cursor: 'context-menu' }}>
              <Typography
                  // textAlign="justify"
                  color={isDeleted ? colors.grey[400] : colors.grey[0]}
                
                  sx={{
                      "&:hover": {
                          color: isDeleted ? colors.grey[0] : colors.grey[400]
                      },
                      textDecoration: isDeleted ? "line-through" : "unset"
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
                  <MenuItem onClick={()=>{handleContextMenuClose();setIsDeleted(true);onDelete();}}>
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