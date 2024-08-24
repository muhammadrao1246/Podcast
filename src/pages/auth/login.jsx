import React, { useContext } from 'react';

import { Box, Button, TextField, Typography, useTheme, IconButton, Link } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';

import useMediaQuery from '@mui/material/useMediaQuery';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useNavigate } from "react-router-dom";
import { Link as DOMLink } from "react-router-dom";

import { useLoginUserMutation } from "src/services/api";
import { ColorModeContext, tokens } from "src/theme";
import { getToken, storeToken } from "src/services/token";
import { setUserToken } from "src/services/authSlice";
import FormAlertsComponent from "src/components/FormAlertsComponent";
import { ROUTES } from "src/routes";

const validationSchema = yup.object().shape({
    email: yup.string().required("required").email(),
    password: yup.string().required("required"),
  });

const Login = () => {
    const navigate = useNavigate()

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const isNonMobile = useMediaQuery('(min-width:600px)');

    
    const [apiMessage, SetApiMessage] = React.useState([])
    const [loginUser, {isLoading}] = useLoginUserMutation()
    const handleSubmit = async (values) => {

        const response = await loginUser(values)
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
            console.log("Login Success")
            let dataObject = response.data;
            console.log(dataObject.data.token)
            // setUserToken(dataObject.data.token)
            storeToken(dataObject.data.token)
            SetApiMessage([{
                type: 'success',
                message: ["User registered successfully!"],
              }])
            console.log(dataObject)
            setTimeout(() => {
                navigate(ROUTES.DASHBOARD)
            }, 1500);
        }

    }

    return (
      <Box height="100vh" bgcolor={colors.primary[600]} display="flex" flexDirection="column">
        <Box
          display="flex"
          alignItems="start"
          justifyContent="end"
          p={2}
          width="100vw"
        >
          <IconButton  onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <LightModeOutlinedIcon sx={{color: "#e0e0e0"}} />
            ) : (
              <DarkModeOutlinedIcon sx={{color: "#e0e0e0"}} />
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
            bgcolor={colors.primary[900]}
          >
            <Typography
              variant="h2"
              color={colors.grey[100]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Hi, Welcome Back!
            </Typography>
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              sx={{ mb: "36px" }}
            >
              login with email and password
            </Typography>

            {apiMessage.map((message) => (
              <FormAlertsComponent
                key={message.type}
                type={message.type}
                message={message.message}
                sx={{ mb: 2 }}
              />
            ))}
            <Formik
              initialValues={{ email: "", password: "" }}
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
                    <Link
                    component={DOMLink}
                     variant="body2" align="right" gutterBottom
                      color={colors.greenAccent[400]}>
                      Forgot Password?
                    </Link>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                  >
                    Sign In
                  </Button>
                  <Typography variant="body" align="center" gutterBottom>
                    Don't have an account?
                    <Link
                      component={DOMLink}
                      to={ROUTES.SIGNUP}
                      color={colors.greenAccent[400]}
                      sx={{ ml: "5px" }}
                    >
                      Sign Up
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

export default Login;
