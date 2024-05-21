import { Box, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataGuest } from "../../data/mockData";
import Header from "../../components/Header";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

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
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                        href="/createGuests"
                    >
                        <PersonAddAltOutlinedIcon sx={{ mr: "10px" }} />
                        Add New Guest
                    </Button>
                </Box>
            </Box>

            <Box m="10px 0 0 0" height="75vh" sx={{
                "& .MuiDataGrid-root" : {
                    border: "none",
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
                    backgroundColor: colors.primary[400],
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
                    rows={mockDataGuest}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                />
            </Box>
        </Box>
    );
}

export default Guest;