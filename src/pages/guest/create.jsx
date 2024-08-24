
import { Box, Button, TextField, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import * as yup from "yup";
import { Formik } from "formik";

import { tokens } from "src/theme";
import Header from "src/components/Layouts/Header/Header";

const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    city: "",
    zipCode: "",
    registrarId: "",
    age: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address: yup.string().required("required"),
  city: yup.string().required("required"),
  zipCode: yup.string().required("required"),
  registrarId: yup.string().required("required"),
  age: yup.string().required("required"),
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
            <Header title="Create Guest" subtitle="Create a New Guest" />

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
                                variant="outlined"
                                type="text"
                                label="First Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.firstName}
                                name="firstName"
                                error={!!touched.firstName && !!errors.firstName}
                                helperText={touched.firstName && errors.firstName}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Last Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.lastName}
                                name="lastName"
                                error={!!touched.lastName && !!errors.lastName}
                                helperText={touched.lastName && errors.lastName}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                name="email"
                                error={!!touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Age"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.age}
                                name="age"
                                error={!!touched.age && !!errors.age}
                                helperText={touched.age && errors.age}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Contact Number"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.contact}
                                name="contact"
                                error={!!touched.contact && !!errors.contact}
                                helperText={touched.contact && errors.contact}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Registrar ID"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.registrarId}
                                name="registrarId"
                                error={!!touched.registrarId && !!errors.registrarId}
                                helperText={touched.registrarId && errors.registrarId}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Address"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.address}
                                name="address"
                                error={!!touched.address && !!errors.address}
                                helperText={touched.address && errors.address}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="City"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.city}
                                name="city"
                                error={!!touched.city && !!errors.city}
                                helperText={touched.city && errors.city}
                                sx={{ gridColumn: "span 2" }}
                            />
                            <TextField
                                fullWidth
                                variant="outlined"
                                type="text"
                                label="Zip Code"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.zipCode}
                                name="zipCode"
                                error={!!touched.zipCode && !!errors.zipCode}
                                helperText={touched.zipCode && errors.zipCode}
                                sx={{ gridColumn: "span 2" }}
                            />
                        </Box>
                        <Box display="flex" justifyContent="end" mt="20px">
                            <Button type="submit" color="secondary" variant="contained">
                                Create New Guest
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
           
        </Box>
    );
}

export default Create;