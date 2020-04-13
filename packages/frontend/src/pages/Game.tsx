import React, { useState } from "react";
import { useAutoMemo } from "hooks.macro";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import Layout from "../components/Layout";
import GameBoard from "../components/GameBoard";
import GameSidebar from "../components/GameSidebar";
import { cities, cityColorsArray, City, pointPairs } from "../map";
import { GameState, Player, BoardPoint } from "../gameTypes";

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
  sidebar: {
    gridArea: "sidebar",
    minWidth: SIDENAV_SIZE,
    [theme.breakpoints.down("md")]: {
      maxHeight: SIDENAV_SIZE,
    },
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    overflow: "hidden",
  },
}));

function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initialGameState: GameState = {
  currentState: { state: "WaitingForPlayers" },
  initiator: "giulio",
  players: [
    {
      name: "Giulio",
      id: "giulio",
      color: "red",
      penalityPoints: 0,
      targetCities: cityColorsArray.map(
        color => randomPick(cities.filter(city => city.color === color)).name
      ),
      startingPoint: null,
    },
  ],
  board: [],
};

export default function Dashboard() {
  const classes = useStyles();

  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const myPlayer = gameState.players[0];
  const myCities = myPlayer.targetCities.map(
    id => cities.find(city => city.name === id) as City
  );
  const startingPoints = useAutoMemo(
    gameState.players
      .map(player => ({
        pos: player.startingPoint,
        player,
      }))
      .filter(p => p.pos !== null)
  ) as {
    pos: BoardPoint;
    player: Player;
  }[];
  const everybodyHasStartingPoint =
    startingPoints.length === gameState.players.length;

  const [placingRailPath, setPlacingRailPath] = useState<
    typeof pointPairs[0] | null
  >(null);
  const [placingStartPiece, setPlacingStartPiece] = useState<
    [number, number] | null
  >(null);

  function handleBoardClick() {
    if (
      gameState.currentState.state === "WaitingForPlayers" &&
      !myPlayer.startingPoint &&
      placingStartPiece
    ) {
      setGameState(state => ({
        ...state,
        players: state.players.map(player =>
          player.id === myPlayer.id
            ? { ...player, startingPoint: placingStartPiece }
            : player
        ),
      }));
      setPlacingStartPiece(null);
    }

    if (
      gameState.currentState.state === "Turn" &&
      gameState.currentState.playerID === myPlayer.id &&
      placingRailPath
    ) {
      if (placingRailPath.double && gameState.currentState.railsLeft >= 2) {
        setGameState(state => {
          if (state.currentState.state === "Turn") {
            return {
              ...state,
              board: [
                ...state.board,
                [placingRailPath.from, placingRailPath.to],
              ],
              currentState: {
                ...state.currentState,
                railsLeft: state.currentState.railsLeft - 2,
              },
            };
          }
          return state;
        });
      } else if (gameState.currentState.railsLeft >= 1) {
        setGameState(state => {
          if (state.currentState.state === "Turn") {
            return {
              ...state,
              board: [
                ...state.board,
                [placingRailPath.from, placingRailPath.to],
              ],
              currentState: {
                ...state.currentState,
                railsLeft: state.currentState.railsLeft - 1,
              },
            };
          }
          return state;
        });
      }

      setPlacingRailPath(null);
    }
  }

  function handleBoardMouseMove({
    point,
    segment,
  }: {
    point: [number, number];
    segment: typeof pointPairs[0];
  }) {
    if (
      gameState.currentState.state === "WaitingForPlayers" &&
      !myPlayer.startingPoint
    ) {
      setPlacingStartPiece(point);
    }

    if (
      gameState.currentState.state === "Turn" &&
      gameState.currentState.playerID === myPlayer.id
    ) {
      if (segment.double && gameState.currentState.railsLeft >= 2) {
        setPlacingRailPath(segment);
      } else if (gameState.currentState.railsLeft >= 1) {
        setPlacingRailPath(segment);
      } else {
        setPlacingRailPath(null);
      }
    }
  }

  function handleBoardMouseLeave() {
    setPlacingRailPath(null);
    setPlacingStartPiece(null);
  }

  function handleStartGame() {
    setGameState(state => ({
      ...state,
      currentState: { state: "Turn", railsLeft: 2, playerID: myPlayer.id },
    }));
  }

  return (
    <Layout>
      <AppBar position="absolute" color="transparent">
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {gameState.currentState.state}
          </Typography>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.container}>
          <div className={classes.gameMapContainer}>
            <GameBoard
              startingPoints={
                placingStartPiece
                  ? [
                      ...startingPoints,
                      { pos: placingStartPiece, player: myPlayer },
                    ]
                  : startingPoints
              }
              userPaths={gameState.board}
              placingPath={
                placingRailPath && [placingRailPath.from, placingRailPath.to]
              }
              onMouseMove={handleBoardMouseMove}
              onMouseLeave={handleBoardMouseLeave}
              onClick={handleBoardClick}
            />
          </div>

          <GameSidebar
            className={classes.sidebar}
            players={gameState.players}
            yourCities={myCities}
            onStartGame={handleStartGame}
            isInitiator={myPlayer.id === gameState.initiator}
            startDisabled={
              gameState.currentState.state !== "WaitingForPlayers" ||
              !everybodyHasStartingPoint
            }
          />
        </div>
      </main>
    </Layout>
  );
}
