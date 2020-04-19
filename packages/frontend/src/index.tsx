import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

import IntroPage from "./pages/IntroPage";
import GamePage from "./pages/GamePage";

import "./globalStyles.css";

const theme = (createMuiTheme as any)({
  palette: {
    type: "dark",
    primary: {
      main: "#bf6618",
    },
    secondary: {
      main: "#71bf18",
    },
  },
  typography: {
    subtitle1: {
      fontSize: 12,
    },
    body1: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/" exact>
            <IntroPage />
          </Route>
          <Route path="/:gameID">
            <GamePage />
          </Route>
        </Switch>
      </Router>
    </MuiThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
