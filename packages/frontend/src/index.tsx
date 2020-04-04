import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

import Game from "./pages/Game";

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
            <Game />
          </Route>
        </Switch>
      </Router>
    </MuiThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
