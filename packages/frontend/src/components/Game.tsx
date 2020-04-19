import React, { useState } from "react";
import { useAutoMemo, useAutoCallback } from "hooks.macro";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import {
  GameState,
  Player,
  BoardPoint,
  cities,
  City,
  pointPairs,
  GameStateAction,
  startGame,
  isSegmentReachable,
  setPlayerInitialPoint,
  placeRail,
} from "@trans-europa/common";

import GameBoard from "../components/GameBoard";
import GameSidebar from "../components/GameSidebar";
import StateDescription from "../components/StateDescription";

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

export default function Game({
  gameState,
  dispatch,
  myPlayer,
}: {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
  myPlayer: Player;
}) {
  const classes = useStyles();

  const startingPoints = useAutoMemo(
    gameState.players
      .map(player => ({
        pos: player.startingPoint,
        player,
      }))
      .filter(p => p.pos !== null) as {
      pos: BoardPoint;
      player: Player;
    }[]
  );
  const everybodyHasStartingPoint =
    startingPoints.length === gameState.players.length;

  const [placingRailPath, setPlacingRailPath] = useState<
    typeof pointPairs[0] | null
  >(null);
  const [placingStartPiece, setPlacingStartPiece] = useState<BoardPoint | null>(
    null
  );

  function handleBoardClick() {
    if (myPlayer) {
      if (
        (gameState.currentState.state === "WaitingForPlayers" ||
          gameState.currentState.state === "EndRound") &&
        !myPlayer.startingPoint &&
        placingStartPiece
      ) {
        dispatch(setPlayerInitialPoint(myPlayer.id, placingStartPiece));
        setPlacingStartPiece(null);
      }

      if (
        gameState.currentState.state === "Turn" &&
        gameState.currentState.playerID === myPlayer.id &&
        placingRailPath
      ) {
        dispatch(placeRail([placingRailPath.from, placingRailPath.to]));
        setPlacingRailPath(null);
      }
    }
  }

  const handleBoardMouseMove = useAutoCallback(function handleBoardMouseMove({
    point,
    segment,
  }: {
    point: [number, number];
    segment: typeof pointPairs[0];
  }) {
    if (
      (gameState.currentState.state === "WaitingForPlayers" ||
        gameState.currentState.state === "EndRound") &&
      myPlayer &&
      !myPlayer.startingPoint
    ) {
      setPlacingStartPiece(point);
    }
    if (
      myPlayer &&
      gameState.currentState.state === "Turn" &&
      gameState.currentState.playerID === myPlayer.id &&
      isSegmentReachable(gameState, [segment.from, segment.to], myPlayer.id)
    ) {
      if (segment.double && gameState.currentState.railsLeft >= 2) {
        setPlacingRailPath(segment);
      } else if (!segment.double && gameState.currentState.railsLeft >= 1) {
        setPlacingRailPath(segment);
      } else {
        setPlacingRailPath(null);
      }
    }
  });

  const handleBoardMouseLeave = useAutoCallback(
    function handleBoardMouseLeave() {
      setPlacingRailPath(null);
      setPlacingStartPiece(null);
    }
  );

  const handleStartGame = useAutoCallback(function handleStartGame() {
    dispatch(startGame());
  });

  const myCities = myPlayer.targetCities.map(
    id => cities.find(city => city.name === id) as City
  );

  return (
    <>
      <AppBar position="absolute">
        <Toolbar>
          <Typography
            component="h1"
            variant="h5"
            color="inherit"
            noWrap
            align="center"
            className={classes.title}
          >
            <StateDescription gameState={gameState} myPlayer={myPlayer} />
          </Typography>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.container}>
          <div className={classes.gameMapContainer}>
            <GameBoard
              usersStartingPoints={
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
              winningState={
                gameState.currentState.state === "EndRound" ||
                gameState.currentState.state === "Finish"
                  ? gameState.currentState
                  : null
              }
              onClick={handleBoardClick}
              onMouseMove={handleBoardMouseMove}
              onMouseLeave={handleBoardMouseLeave}
            />
          </div>

          <GameSidebar
            className={classes.sidebar}
            players={gameState.players}
            yourCities={myCities}
            playerTurnID={
              (gameState.currentState.state === "Turn" &&
                gameState.currentState.playerID) ||
              null
            }
            onStartGame={handleStartGame}
            isInitiator={myPlayer.id === gameState.initiatorID}
            startDisabled={
              myPlayer.id !== gameState.initiatorID ||
              gameState.currentState.state == "Turn" ||
              !everybodyHasStartingPoint
            }
          />
        </div>
      </main>
    </>
  );
}
