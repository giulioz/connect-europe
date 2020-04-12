import React from "react";
import { useAutoMemo } from "hooks.macro";
import { withParentSize } from "@vx/responsive";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import { deepOrange, yellow, blue, green, red } from "@material-ui/core/colors";

import Layout from "../components/Layout";
import { points, cities, cityColorsArray } from "../map";

const SIDENAV_SIZE = 256;

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    flexGrow: 1,
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
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
  },
  listItem: {
    width: theme.spacing(32),
  },
  listItemBreak: {
    [theme.breakpoints.down("md")]: {
      flexBasis: "100%",
      width: 0,
    },
  },
  sidebarCityName: {
    textTransform: "capitalize",
  },
  blueCityAvatar: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
  },
  redCityAvatar: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  greenCityAvatar: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
  orangeCityAvatar: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  yellowCityAvatar: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
  },
  cityNameContainer: {
    fill: "green",
    stroke: theme.palette.common.white,
    opacity: 0.5,
  },
  cityName: {
    fill: theme.palette.common.white,
    textAnchor: "middle",
    font: `20px sans-serif`,
  },
}));

function calcX(px: number) {
  return px * 47.5 + 47.5;
}
function calcY(py: number) {
  return py * 84.5 + 55;
}
function calcPos(px: number, py: number, offsetX = 0, offsetY = 0) {
  return { x: calcX(px) + offsetX, y: calcY(py) + offsetY };
}

const cityBulletSize = 60;

function uniquePairs(pairs: [[number, number], [number, number]][]) {
  return pairs.reduce(
    (acc: [[number, number], [number, number]][], pair) =>
      !acc.find(
        accElement =>
          accElement[0][0] === pair[0][0] &&
          accElement[0][1] === pair[0][1] &&
          accElement[1][0] === pair[1][0] &&
          accElement[1][1] === pair[1][1]
      )
        ? [...acc, pair]
        : acc,
    []
  );
}

const pointPairs = points
  .reduce(
    (arr: [[number, number], [number, number]][], p1) =>
      uniquePairs([
        ...arr,
        ...points
          .filter(
            p2 =>
              !(p2[0] === p1[0] && p2[1] === p1[1]) &&
              (Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2) <=
                Math.sqrt(2) ||
                (p2[1] - p1[1] === 0 && p2[0] - p1[0] === 2))
          )
          .map<[[number, number], [number, number]]>(
            p2 =>
              [p1, p2].sort((a, b) => a[0] - b[0]) as [
                [number, number],
                [number, number]
              ]
          ),
      ]),
    []
  )
  .map(([from, to]) => ({ from, to, double: Math.random() > 0.75 }));

function OffsettedLine({
  x1,
  x2,
  y1,
  y2,
  offset = 0,
  lengthOffset = 0,
  startPiece = false,
  endPiece = false,
  piecesSize = 15,
  ...rest
}: React.SVGProps<SVGLineElement> & {
  offset?: number;
  lengthOffset?: number;
  startPiece?: boolean;
  endPiece?: boolean;
  piecesSize?: number;
}) {
  const x1Parsed = x1 ? Number(x1) : 0;
  const y1Parsed = y1 ? Number(y1) : 0;
  const x2Parsed = x2 ? Number(x2) : 0;
  const y2Parsed = y2 ? Number(y2) : 0;

  const deltaX = x2Parsed - x1Parsed;
  const deltaY = y2Parsed - y1Parsed;
  const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const cosine = deltaX / delta;
  const sine = deltaY / delta;

  if (deltaY === 0) {
    return (
      <line
        x1={endPiece ? x2Parsed - piecesSize : x1Parsed + lengthOffset}
        y1={y1Parsed - offset}
        x2={startPiece ? x1Parsed + piecesSize : x2Parsed - lengthOffset}
        y2={y2Parsed - offset}
        {...rest}
      />
    );
  } else {
    if (startPiece) {
      return (
        <line
          x1={x1Parsed}
          y1={y1Parsed}
          x2={x1Parsed + cosine * piecesSize}
          y2={y1Parsed + sine * piecesSize}
          {...rest}
        />
      );
    } else if (endPiece) {
      return (
        <line
          x1={x2Parsed}
          y1={y2Parsed}
          x2={x2Parsed - cosine * piecesSize}
          y2={y2Parsed - sine * piecesSize}
          {...rest}
        />
      );
    } else {
      return (
        <line
          x1={x1Parsed + offset * cosine + cosine * lengthOffset}
          y1={y1Parsed - offset * sine + sine * lengthOffset}
          x2={x2Parsed + offset * cosine - cosine * lengthOffset}
          y2={y2Parsed - offset * sine - sine * lengthOffset}
          {...rest}
        />
      );
    }
  }
}

function RailLine({
  fromP,
  toP,
  double,
  ...rest
}: React.SVGProps<SVGLineElement> & {
  fromP: [number, number];
  toP: [number, number];
  double: boolean;
}) {
  return double ? (
    <>
      <OffsettedLine
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        stroke="black"
        strokeWidth={5}
        startPiece
      />
      <OffsettedLine
        stroke="black"
        strokeWidth={5}
        lengthOffset={20}
        {...rest}
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        offset={5}
      />
      <OffsettedLine
        stroke="black"
        strokeWidth={5}
        lengthOffset={20}
        {...rest}
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        offset={-5}
      />
      <OffsettedLine
        x1={calcX(fromP[0])}
        y1={calcY(fromP[1])}
        x2={calcX(toP[0])}
        y2={calcY(toP[1])}
        stroke="black"
        strokeWidth={5}
        endPiece
      />
    </>
  ) : (
    <OffsettedLine
      stroke="black"
      strokeWidth={5}
      {...rest}
      offset={0}
      x1={calcX(fromP[0])}
      y1={calcY(fromP[1])}
      x2={calcX(toP[0])}
      y2={calcY(toP[1])}
    />
  );
}

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

      {/* {points.map(([x, y]) => (
        <circle
          key={[x, y].join(",")}
          cx={x * 47.5 + 47.5}
          cy={y * 84.5 + 55}
          fill="yellow"
          r={8}
        />
      ))} */}

      {pointPairs.map(({ from, to, double }) => (
        <RailLine
          fromP={from}
          toP={to}
          double={double}
          key={`${from}-${to}-${double}`}
          onMouseMove={console.log}
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
            width={textWidth * 2 + 16}
            height={32}
            rx={5}
            className={classes.cityNameContainer}
          />
          <text
            {...calcPos(x, y)}
            transform={`translate(0,${cityBulletSize / 2 + 23})`}
            className={classes.cityName}
          >
            {name.toUpperCase()}
          </text>
        </>
      ))}
    </svg>
  );
});

function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Dashboard() {
  const classes = useStyles();

  const players = ["Giulio", "Giacomo"];
  const yourCities = useAutoMemo(
    cityColorsArray.map(color =>
      randomPick(cities.filter(city => city.color === color))
    )
  );

  return (
    <Layout>
      <AppBar position="absolute">
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Trans Europa
          </Typography>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.container}>
          <div className={classes.gameMapContainer}>
            <GameBoard />
          </div>

          <List component="div" className={classes.sidebar}>
            <ListSubheader>Players</ListSubheader>
            {players.map(player => (
              <ListItem className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar>{player.substr(0, 1).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText>{player}</ListItemText>
              </ListItem>
            ))}

            <div className={classes.listItemBreak} />

            <ListSubheader>Your Cities</ListSubheader>
            {yourCities.map(city => (
              <ListItem className={classes.listItem}>
                <ListItemAvatar>
                  <Avatar
                    className={(classes as any)[`${city.color}CityAvatar`]}
                  >
                    {city.name.substr(0, 1).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText className={classes.sidebarCityName}>
                  {city.name}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </div>
      </main>
    </Layout>
  );
}
