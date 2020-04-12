import React from "react";
import { withParentSize } from "@vx/responsive";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

import Layout from "../components/Layout";
import { points } from "../map";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    flexGrow: 1,
  },
  gameMapContainer: {
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 900,
  },
  gameBoardSvg: {
    display: "block",
  },
  sidebar: {
    minHeight: 200,
    minWidth: 250,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
}));

// const points = new Array(34 * 14)
//   .fill(0)
//   .map((k, i) => [i % 34, Math.floor(i / 34)])
//   .filter(
//     ([x, y]) => (y % 2 === 1 && x % 2 === 0) || (y % 2 === 0 && x % 2 === 1)
//   );
// console.log(JSON.stringify(points));

const GameBoard = withParentSize(function GameBoard({
  parentWidth,
  parentHeight,
}) {
  const classes = useStyles();

  return (
    <svg
      className={classes.gameBoardSvg}
      width={parentWidth}
      height={parentHeight}
      viewBox="0 0 1920 1227"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href={`${process.env.PUBLIC_URL}/map.jpg`}></image>

      {points.map(([x, y]) => (
        <circle
          key={[x, y].join(",")}
          cx={x * 47.5 + 47.5}
          cy={y * 84.5 + 55}
          fill="yellow"
          r={8}
        />
      ))}
    </svg>
  );
});

export default function Dashboard() {
  const classes = useStyles();

  const players = ["Giulio", "Giacomo", "Sandro"];

  return (
    <Layout title="Trans Europa">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.container}>
          <div className={classes.gameMapContainer}>
            <GameBoard />
          </div>

          <div className={classes.sidebar}>
            <Typography variant="overline">Giocatori</Typography>
            <List>
              {players.map(player => (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{player.substr(0, 1).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText>{player}</ListItemText>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      </main>
    </Layout>
  );
}
