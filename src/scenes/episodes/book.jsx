import { Box, Button, TextField, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Formik } from "formik";
import React from "react";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

const checkoutSchema = yup.object().shape({
  episodeName: yup.string().required("required"),
});

const Book = () => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const initialValues = {
        episodeName: "",
        bookingDate: Date.now(),
    };

    const handleFormSubmit = (values) => {
        console.log(values);

    }
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            <Header title="Book Episode" subtitle="Book a New Episode" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={checkoutSchema}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    }) => (
                    <form onSubmit={handleSubmit}>
                        <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                        sx={{
                            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                            "& .MuiPickersLayout-root": {
                                background: `${colors.primary[400]} !important`,
                            },
                            "& .MuiPickersDay-root.Mui-selected": {
                                backgroundColor: `#6870fa !important`,
                            },
                        }}
                        >
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Episode Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.episodeName}
                                name="episodeName"
                                error={!!touched.episodeName && !!errors.episodeName}
                                helperText={touched.episodeName && errors.episodeName}
                                sx={{ gridColumn: "span 3" }}
                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <StaticDatePicker  
                                    displayStaticWrapperAs="desktop"
                                    value={values.bookingDate}
                                    name="bookingDate"
                                    sx={{ gridColumn: "span 3" }}
                                    slotProps={{
                                        toolbar: { toolbarFormat: 'dd MMMM, yyyy', hidden: false },
                                      }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box display="flex" justifyContent="start" mt="20px">
                            <Button type="submit" color="secondary" variant="contained">
                                Book Episode
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
           
        </Box>
    );
}

export default Book;