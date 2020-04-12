import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
  },
}));

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      {children}
    </div>
  );
}
