// App.js
import { Routes, Route, Outlet } from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import MainLayout from "./MainLayout";
import AuthLayout from "./AuthLayout";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Guest from "./scenes/guest";
import Episodes from "./scenes/episodes";
import CreateGuest from "./scenes/guest/create";
import CreateEpisode from "./scenes/episodes/create";
import BookEpisode from "./scenes/episodes/book";
import Login from "./scenes/auth/login";
import Signup from "./scenes/auth/signup";

function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Routes that include the sidebar and topbar */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="team" element={<Team />} />
            <Route path="guests" element={<Guest />} />
            <Route path="episodes" element={<Episodes />} />
            <Route path="createGuest" element={<CreateGuest />} />
            <Route path="createEpisode" element={<CreateEpisode />} />
            <Route path="bookEpisode" element={<BookEpisode />} />
          </Route>
          {/* Routes that do not include the sidebar and topbar */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
