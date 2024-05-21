import { Box, Button, TextField, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Formik } from "formik";

const initialValues = {
    premierProLink: "",
    driveFolderLink: "",
};

const checkoutSchema = yup.object().shape({
  premierProLink: yup.string().required("required"),
  driveFolderLink: yup.string().required("required"),
});

const Create = () => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const handleFormSubmit = (values) => {
        console.log(values);

    }
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            <Header title="Create Episode" subtitle="Create a New Episode" />

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
                        }}
                        >
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Link Premier Pro Project"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.premierProLink}
                                name="premierProLink"
                                error={!!touched.premierProLink && !!errors.premierProLink}
                                helperText={touched.premierProLink && errors.premierProLink}
                                sx={{ gridColumn: "span 3" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Link Folder Drive"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.driveFolderLink}
                                name="driveFolderLink"
                                error={!!touched.driveFolderLink && !!errors.driveFolderLink}
                                helperText={touched.driveFolderLink && errors.driveFolderLink}
                                sx={{ gridColumn: "span 3" }}
                            />
                        </Box>
                        <Box display="flex" justifyContent="start" mt="20px">
                            <Button type="submit" color="secondary" variant="contained">
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