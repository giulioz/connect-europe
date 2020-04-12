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
import { points, cities } from "../map";

const SIDENAV_SIZE = 200;

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    flexGrow: 1,
    maxHeight: "calc(100vh - 64px)",
    display: "grid",
    gridTemplateColumns: `auto ${SIDENAV_SIZE}px`,
    gridTemplateRows: `auto ${SIDENAV_SIZE}px`,
    gridTemplateAreas: `'gameMap sidebar' 'gameMap sidebar'`,
    [theme.breakpoints.down("md")]: {
      gridTemplateAreas: `'gameMap gameMap' 'sidebar sidebar'`,
    },
  },
  gameMapContainer: {
    gridArea: "gameMap",
    placeSelf: "center",
    width: "100%",
    height: "100%",
    [theme.breakpoints.down("md")]: {
      minWidth: 0,
      minHeight: 0,
    },
  },
  gameBoardSvg: {
    display: "block",
  },
  sidebar: {
    gridArea: "sidebar",
    minWidth: SIDENAV_SIZE,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      maxHeight: SIDENAV_SIZE,
    },
  },
  cityName: {
    fill: theme.palette.common.white,
    textAnchor: "middle",
    font: `20px sans-serif`,
  },
}));

function calcPos(px: number, py: number, offsetX = 0, offsetY = 0) {
  return { x: px * 47.5 + 47.5 + offsetX, y: py * 84.5 + 55 + offsetY };
}

const cityBulletSize = 60;

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
      <image href={`${process.env.PUBLIC_URL}/background.png`}></image>

      {points.map(([x, y]) => (
        <circle
          key={[x, y].join(",")}
          cx={x * 47.5 + 47.5}
          cy={y * 84.5 + 55}
          fill="yellow"
          r={8}
        />
      ))}

      {cities.map(({ name, color, position: [x, y], textWidth }) => (
        <>
          <image
            {...calcPos(x, y)}
            width={cityBulletSize}
            height={cityBulletSize}
            transform={`translate(-${cityBulletSize / 2},-${cityBulletSize /
              2})`}
            href={`${process.env.PUBLIC_URL}/${color}.png`}
          ></image>
          <rect
            {...calcPos(x, y)}
            transform={`translate(${-(textWidth + 8)},${cityBulletSize / 2})`}
            fill="green"
            width={textWidth * 2 + 16}
            height={32}
            opacity={0.5}
          />
          <text
            {...calcPos(x, y)}
            transform={`translate(0,${cityBulletSize / 2 + 24})`}
            className={classes.cityName}
          >
            {name.toUpperCase()}
          </text>
        </>
      ))}
    </svg>
  );
});

export default function Dashboard() {
  const classes = useStyles();

  const players = ["Giulio", "Giacomo"];

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
