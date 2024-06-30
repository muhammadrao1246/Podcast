// import * as React from 'react';
import { CloseOutlined } from '@mui/icons-material';
import { IconButton, colors, useTheme } from '@mui/material';
import { closeSnackbar, enqueueSnackbar } from 'notistack';

import { tokens } from "src/theme";



export function ClosableToast(message, status, duration = 2000, props) {
    return enqueueSnackbar(message,{
        anchorOrigin: {vertical: "top", horizontal: "center"},
        autoHideDuration: duration,
        action: key=>(
            <IconButton onClick={()=>closeSnackbar(key)}>
                <CloseOutlined />
            </IconButton>
        ),
        variant: status,
        ...props
    })
}