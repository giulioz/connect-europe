import React, { useState } from "react";
import { useAutoMemo } from "hooks.macro";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import {
  GameState,
  Player,
  BoardPoint,
  cities,
  cityColorsArray,
  City,
  pointPairs,
  randomPick,
  GameStateAction,
} from "@trans-europa/common";
import Layout from "../components/Layout";
import GameBoard from "../components/GameBoard";
import GameSidebar from "../components/GameSidebar";
import { useRemoteState } from "../api/hooks";

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

const initialGameState: GameState = {
  gameID: "",
  currentState: { state: "WaitingForPlayers" },
  initiatorID: "giulio",
  lastWinnerID: null,
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

function StateDescription({
  gameState,
  myPlayer,
}: {
  gameState: GameState;
  myPlayer: Player;
}) {
  switch (gameState.currentState.state) {
    case "WaitingForPlayers":
      return (
        <>
          {!myPlayer.startingPoint && <>Place your starting point. </>}
          {gameState.initiatorID === myPlayer.id && (
            <>Press START GAME when everybody is ready.</>
          )}
          {gameState.initiatorID !== myPlayer.id && myPlayer.startingPoint && (
            <>Wait for the other players…</>
          )}
        </>
      );

    case "Turn":
      if (gameState.currentState.playerID === myPlayer.id) {
        return (
          <>
            It's your turn. You can place {gameState.currentState.railsLeft}{" "}
            more rails.
          </>
        );
      } else {
        return <>Wait for your turn.</>;
      }

    default:
      return null;
  }
}

function GameWrapper({
  gameState,
  dispatch,
}: {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
}) {
  const classes = useStyles();

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
  const [placingStartPiece, setPlacingStartPiece] = useState<
    [number, number] | null
  >(null);

  function handleBoardClick() {
    if (
      gameState.currentState.state === "WaitingForPlayers" &&
      !myPlayer.startingPoint &&
      placingStartPiece
    ) {
      // setGameState(state => ({
      //   ...state,
      //   players: state.players.map(player =>
      //     player.id === myPlayer.id
      //       ? { ...player, startingPoint: placingStartPiece }
      //       : player
      //   ),
      // }));
      setPlacingStartPiece(null);
    }

    if (
      gameState.currentState.state === "Turn" &&
      gameState.currentState.playerID === myPlayer.id &&
      placingRailPath
    ) {
      if (placingRailPath.double && gameState.currentState.railsLeft >= 2) {
        // setGameState(state => {
        //   if (state.currentState.state === "Turn") {
        //     return {
        //       ...state,
        //       board: [
        //         ...state.board,
        //         [placingRailPath.from, placingRailPath.to],
        //       ],
        //       currentState: {
        //         ...state.currentState,
        //         railsLeft: state.currentState.railsLeft - 2,
        //       },
        //     };
        //   }
        //   return state;
        // });
      } else if (
        !placingRailPath.double &&
        gameState.currentState.railsLeft >= 1
      ) {
        // setGameState(state => {
        //   if (state.currentState.state === "Turn") {
        //     return {
        //       ...state,
        //       board: [
        //         ...state.board,
        //         [placingRailPath.from, placingRailPath.to],
        //       ],
        //       currentState: {
        //         ...state.currentState,
        //         railsLeft: state.currentState.railsLeft - 1,
        //       },
        //     };
        //   }
        //   return state;
        // });
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
      } else if (!segment.double && gameState.currentState.railsLeft >= 1) {
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
    // setGameState(state => ({
    //   ...state,
    //   currentState: { state: "Turn", railsLeft: 2, playerID: myPlayer.id },
    // }));
  }

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
            <StateDescription gameState={gameState} myPlayer={myPlayer} />
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
            isInitiator={myPlayer.id === gameState.initiatorID}
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

export default function Game() {
  const [gameState, dispatch] = useRemoteState();
  if (gameState === null || dispatch === null) {
    return null;
  }

  return <GameWrapper gameState={gameState} dispatch={dispatch} />;
}
