import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Sidebar from "./scenes/global/ProSidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Guest from "./scenes/guest";
import Episodes from "./scenes/episodes";
import CreateGuest from "./scenes/guest/create";
import CreateEpisode from "./scenes/episodes/create";
import BookEpisode from "./scenes/episodes/book";
// import Invoices from "./scenes/invoices";
// import Contacts from "./scenes/contacts";
// import Bar from "./scenes/bar";
// import Form from "./scenes/form";
// import Line from "./scenes/line";
// import Pie from "./scenes/pie";
// import FAQ from "./scenes/faq";
// import Geography from "./scenes/geography";
// import Calendar from "./scenes/calendar";

function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />}></Route>
              <Route path="/team" element={<Team />}></Route>
              {/* <Route path="/invoices" element={<Invoices />}></Route> */}
              <Route path="/guests" element={<Guest />}></Route>
              <Route path="/episodes" element={<Episodes />}></Route>
              <Route path="/createGuest" element={<CreateGuest />}></Route>
              <Route path="/createEpisode" element={<CreateEpisode />}></Route>
              <Route path="/bookEpisode" element={<BookEpisode />}></Route>
              {/* <Route path="/form" element={<Form />}></Route> */}
              {/* <Route path="/bar" element={<Bar />}></Route> */}
              {/* <Route path="/pie" element={<Pie />}></Route> */}
              {/* <Route path="/line" element={<Line />}></Route> */}
              {/* <Route path="/faq" element={<FAQ />}></Route> */}
              {/* <Route path="/geography" element={<Geography />}></Route> */}
              {/* <Route path="/calendar" element={<Calendar />}></Route> */}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
