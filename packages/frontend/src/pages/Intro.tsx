import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TrainIcon from "@material-ui/icons/Train";

import Layout from "../components/Layout";
import config from "../config";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    height: `calc(100% - 64px)`,
  },
  trainIcon: {
    marginRight: theme.spacing(2),
  },
}));

export default function Dashboard() {
  const classes = useStyles();

  const roomId = btoa(Math.round(Math.random() * 50000).toString());

  return (
    <Layout>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Typography variant="h1" gutterBottom>
            <TrainIcon fontSize="inherit" className={classes.trainIcon} />
            Trans Europa
          </Typography>
          <Typography gutterBottom>
            To start a new game send this link to your friends and press the
            button below:
          </Typography>
          <pre>
            {config.baseURL}
            {roomId}
          </pre>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to={`/${roomId}`}
          >
            Start Game
          </Button>
        </Container>
      </main>
    </Layout>
  );
}
