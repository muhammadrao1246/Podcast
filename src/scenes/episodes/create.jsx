import { Box, Button, TextField, useTheme, LinearProgress, Typography  } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Formik } from "formik";
import { useSaveEpisodesSheetMutation } from "../../app/api";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import { CloudUpload } from "@mui/icons-material";

const initialValues = {
    project_link: "",
    sheet_link: "",
    excel_file: "",
};

const checkoutSchema = yup.object().shape({
  project_link: yup.string().required("required").url(),
  sheet_link: yup.string().required("required").url(),
});

const Create = () => {
    const navigate = useNavigate()
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const [apiErrors, SetApiErrors] = React.useState({})
    const [progress, setProgress] = React.useState(0);
    const [saveEpisode, {isLoading}] = useSaveEpisodesSheetMutation()
    const fileInputRef = React.useRef(null);
    const handleSubmit = async (values) => {
        console.log(values);
        const response = await saveEpisode(values)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            SetApiErrors(dataObject.errors)
            
        } else {
            console.log("Sheet Upload Success")
            let dataObject = response.data;

            console.log(dataObject)
            navigate("/episodes")
        }

    }

    const handleFileUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        console.log('File uploaded:', file);
        setFieldValue("excel_file", file);
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            <Header title="Create Episode" subtitle="Create a New Episode" />

            <Formik
                onSubmit={handleSubmit}
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
                    setFieldValue,
                    }) => (
                    <form onSubmit={handleSubmit}>
                        <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                        sx={{
                            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                        }}
                        >
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Link Premier Pro Project"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.project_link}
                                name="project_link"
                                error={!!touched.project_link && !!errors.project_link}
                                helperText={touched.project_link && errors.project_link}
                                sx={{ gridColumn: "span 3" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Link Episode Sheet"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.sheet_link}
                                name="sheet_link"
                                error={!!touched.sheet_link && !!errors.sheet_link}
                                helperText={touched.sheet_link && errors.sheet_link}
                                sx={{ gridColumn: "span 3" }}
                            />
                            <Typography justifyContent="center" sx={{ gridColumn: "span 3" }} >Or Upload File Instead</Typography>
                            <TextField 
                                type="file" 
                                inputRef={fileInputRef}
                                onChange={(event) => handleFileUpload(event, setFieldValue)}
                                style={{ display: 'none' }}
                                />
                            <Button variant="outlined" size="large" color="secondary" startIcon={<CloudUpload />} onClick={handleUploadButtonClick} component="span" sx={{ gridColumn: "span 3" }}>
                                Upload File
                            </Button>
                        </Box>
                        {isLoading && (
                            <Box mt="20px" width="100%" sx={{ gridColumn: "span 3" }} >
                                <LinearProgress color="secondary" sx={{ height: '10px', borderRadius: '5px', gridColumn: "span 3" }} />
                            </Box>
                        )}
                        <Box display="flex" justifyContent="start" mt="20px">
                            <Button type="submit" color="secondary" variant="contained" disabled={isLoading}>
                                Create New Episode
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
           
        </Box>
    );
}

export default Create;