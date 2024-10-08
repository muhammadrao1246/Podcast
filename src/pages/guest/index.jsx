import { Box, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

import { Link as DOMLink } from "react-router-dom";

import { tokens } from "src/theme";
import { mockDataGuest } from "src/data/mockData";
import Header from "src/components/Layouts/Header/Header";
import { ROUTES } from "src/routes";

const Guest = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "registrarId", headerName: "Registrar ID"},
        { field: "name", headerName: "Guest Name", flex: 1, cellClassName: "name-column--cell",},
        { field: "age", headerName: "Age", type: "number", headerAlign: "left", align: "left",},
        { field: "email", headerName: "Email", flex: 1,},
        { field: "phone", headerName: "Phone Number", flex: 1,},
        { field: "address", headerName: "Address", flex: 1,},
        { field: "city", headerName: "City", flex: 1,},
        { field: "zipCode", headerName: "Zip Code", flex: 1,},
    ];
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Guests" subtitle="List of Guests for Podcast" />
                <Box>
                    <Button
                        sx={{
                            backgroundColor: "transparent",
                            border: `1.5px solid ${colors.grey[100]}`,
                            color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                        
                        LinkComponent={DOMLink}
                        to={ROUTES.GUESTS_ADD}
                    >
                        <PersonAddAltOutlinedIcon sx={{ mr: "10px" }} />
                        Add New Guest
                    </Button>
                </Box>
            </Box>

            <Box m="10px 0 0 0" height="70vh" sx={{
                "& .MuiDataGrid-root" : {
                    border: "none",
                    // borderRadius: "15px"
                },
                "& .MuiDataGrid-cell" : {
                    borderBottom: "none",
                },
                "& .name-column--cell" : {
                    color: colors.greenAccent[300]
                },
                "& .MuiDataGrid-columnHeader" : {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller" : {
                    backgroundColor: colors.blueAccent[900],
                },
                "& .MuiDataGrid-footerContainer" : {
                    borderTop: "none",
                    backgroundColor: colors.blueAccent[700],
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                    color: `${colors.grey[100]} !important`,
                  },
            }}>
                <DataGrid
                sx={{height: "100%", borderRadius: "5px"}}
                    
                    rows={mockDataGuest}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                />
            </Box>
        </Box>
    );
}

export default Guest;