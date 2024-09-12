import React from 'react'
import {
  Routes,
  Route,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// importing global css that is going to be used on every page
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// importing layout component in which whole page structure is defined

// routes/url.jsx have all urls defined in a map
import {ROUTES} from 'src/routes';

import "src/assets/css/index.css"

import MainLayout from './components/Layouts/MainLayout';
import AuthLayout from './components/Layouts/AuthLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { PrivateRoute, PublicRoute } from './helpers/protectors';


// all pages components are declared here
const DASHBOARD_PAGE = React.lazy(() => import("src/pages/dashboard/index"))
const TEAM_PAGE = React.lazy(() => import("src/pages/team/index"))
const BUILDER_PAGE = React.lazy(() => import("src/pages/builder/index"))
const GUESTS_PAGE = React.lazy(() => import("src/pages/guest/index"))
const GUESTS_ADD_PAGE = React.lazy(() => import("src/pages/guest/create"))
const EPISODES_PAGE = React.lazy(() => import("src/pages/episodes/index"))
const EPISODES_ADD_PAGE = React.lazy(() => import("src/pages/episodes/create"))
const EPISODES_BOOK_PAGE = React.lazy(() => import("src/pages/episodes/book"))
const EPISODES_CHAPTERS_PAGE = React.lazy(() => import("src/pages/chapters/index"))
const EPISODES_REELS_PAGE = React.lazy(() => import("src/pages/reels/index"))

// error pages
function ErrorHandler(){
  const error = useRouteError()

  // if item not found or page not found error
  if (isRouteErrorResponse(error) && error.status == 404)
  {
    return <h1>Not Found Error 404</h1>
  }
  // if a server error
  else if(isRouteErrorResponse(error) && error.status == 500)
  {
    return <h1>Internal Server Error 500</h1>
  }
  else if(isRouteErrorResponse(error) && error.status == 401)
  {
    return <h1>Token Expired Error 401</h1>
  }

  return <h1>Unknown Error</h1>
}



function App() {
  const [theme, colorMode] = useMode();

  React.useEffect(()=>{
    // TimeAgo.addDefaultLocale(en); // setting output timesince language as english
    TimeAgo.addLocale(en); // setting output timesince language as english
  },[])


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Routes that include the sidebar and topbar */}
          <Route errorElement={<ErrorHandler />} path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path={ROUTES.DASHBOARD} element={<DASHBOARD_PAGE />} />
            <Route path={ROUTES.TEAM} element={<TEAM_PAGE />} />
            <Route path={ROUTES.GUESTS} element={<GUESTS_PAGE />} />
            <Route path={ROUTES.GUESTS_ADD} element={<GUESTS_ADD_PAGE />} />
            <Route path={ROUTES.BUILDER} element={<BUILDER_PAGE />} />
            <Route path={ROUTES.EPISODES} element={<EPISODES_PAGE />} />
            <Route path={ROUTES.EPISODES_ADD} element={<EPISODES_ADD_PAGE />} />
            <Route path={ROUTES.EPISODES_BOOK} element={<EPISODES_BOOK_PAGE />} />
            <Route path={ROUTES.CHAPTERS} element={<EPISODES_CHAPTERS_PAGE />} />
            <Route path={ROUTES.REELS} element={<EPISODES_REELS_PAGE />} />
          </Route>
          {/* Routes that do not include the sidebar and topbar */}
          <Route errorElement={<ErrorHandler />} path="/" element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route index path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<Signup />} />
            <Route path={ROUTES.FORGOT} element={<ForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          </Route>
          <Route path='*' element={<h1>Page Not Found</h1>} />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
