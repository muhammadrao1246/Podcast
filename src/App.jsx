import React from 'react'
import {
  Routes,
  Route,
  createBrowserRouter,
  isRouteErrorResponse,
  RouterProvider,
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
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';


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
          <Route path="/" element={<MainLayout />}>
            <Route title="Dashboard" path={ROUTES.DASHBOARD} element={<DASHBOARD_PAGE />} />
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
          <Route path="/" element={<AuthLayout />}>
            <Route index path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.SIGNUP} element={<Signup />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
