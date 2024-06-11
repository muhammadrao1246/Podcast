import { useContext, useState } from "react";
import React from 'react';
import { Box, Button, TextField, Typography, useTheme, IconButton, Link } from '@mui/material';
import { Formik, Form } from 'formik';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ColorModeContext, tokens } from "../../theme";
import * as yup from 'yup';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useRegisterUserMutation } from "../../app/api";
import { useNavigate } from "react-router-dom";
import { storeToken } from "../../app/token";
import FormAlertsComponent from "../../components/FormAlertsComponent";

const validationSchema = yup.object().shape({
    full_name: yup.string().required("required"),
    email: yup.string().required("required").email(),
    password: yup.string().required("required").min(8),
    password2: yup.string().required("required").oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

const Signup = () => {
    const navigate = useNavigate()

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const isNonMobile = useMediaQuery('(min-width:600px)');

    const [apiMessage, SetApiMessage] = useState([])
    const [registerUser, {isLoading}] = useRegisterUserMutation()
    const handleSubmit = async (values) => {

        const response = await registerUser(values)
        if (!!response.error) {
            let dataObject = response.error.data;
            console.log(dataObject.errors);
            
            SetApiMessage(
              Object.keys(dataObject.errors).map((errorType, index) => {
                return {
                  type: errorType,
                  message: dataObject.errors[errorType],
                };
              })
            );
        } else {
            console.log("Registration Success")
            let dataObject = response.data.data;
            storeToken(dataObject.token)
            SetApiMessage([{
              type: 'success',
              message: ["User registered successfully!"],
            }])
            console.log(dataObject)
            setTimeout(() => {
                navigate("/dashboard")
            }, 1500);
        }

    }

    return (
      <Box height="100vh" display="flex" flexDirection="column">
        <Box
          display="flex"
          alignItems="start"
          justifyContent="end"
          p={2}
          width="100vw"
        >
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Box
            width="100%"
            maxWidth="400px"
            padding="32px"
            borderRadius="8px"
            bgcolor={colors.primary[400]}
          >
            <Typography
              variant="h2"
              color={colors.grey[100]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Sign Up
            </Typography>
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              sx={{ mb: "36px" }}
            >
              Fill out these fields to signup
            </Typography>

            {
              apiMessage.map(message=>(
                <FormAlertsComponent
                key={message.type}
                  type={message.type}
                  message={message.message}
                  sx={{mb: 2}} 
                  />
              ))
            }
            
            <Formik
              initialValues={{
                full_name: "",
                // username: "",
                email: "",
                password: "",
                password2: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <Form
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing(2),
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.full_name}
                    name="full_name"
                    error={!!touched.full_name && !!errors.full_name}
                    helperText={touched.full_name && errors.full_name}
                  />
                  {/* <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Username"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.username}
                                name="username"
                                error={!!touched.username && !!errors.username}
                                helperText={touched.username && errors.username}
                            /> */}
                  <TextField
                    fullWidth
                    variant="filled"
                    type="email"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="password"
                    label="Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="password"
                    label="Confirm Password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password2}
                    name="password2"
                    error={!!touched.password2 && !!errors.password2}
                    helperText={touched.password2 && errors.password2}
                  />
                  <Typography variant="body2" align="left" gutterBottom>
                    By signing up, you confirm that you've read and accept our
                    <Link
                      href="#"
                      color={colors.greenAccent[400]}
                      sx={{ ml: "5px", mr: "5px" }}
                    >
                      Terms of Services
                    </Link>
                    and
                    <Link
                      href="#"
                      color={colors.greenAccent[400]}
                      sx={{ ml: "5px" }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    // href="/dashboard"
                  >
                    Sign Up
                  </Button>
                  <Typography variant="body" align="center" gutterBottom>
                    Already have an account?
                    <Link
                      href="/"
                      color={colors.greenAccent[400]}
                      sx={{ ml: "5px" }}
                    >
                      Login
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>
    );
};

export default Signup;
