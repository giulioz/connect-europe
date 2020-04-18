import http from "http";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket from "ws";
import { createStore, Store } from "redux";

import {
  createInitialGameState,
  setState,
  gameStateReducer,
  GameState,
  GameStateAction,
  WSPayload,
  removePlayer,
} from "@trans-europa/common";
import ep from "./safeEndpoints";

require("dotenv").config();

const host = process.env.SERVER_HOST ? process.env.SERVER_HOST : "0.0.0.0";
const port = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT, 10)
  : 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../../../../frontend/build/")));

const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

const games: {
  [gameID: string]: Store<GameState | null, GameStateAction>;
} = {};

const usersWS: {
  [playerId: string]: { gameID: string; ws: WebSocket };
} = {};

ep(app, "GET /state/:gameID", (req, res) => {
  if (!games[req.params.gameID]) {
    initState(req.params.gameID);
  }

  const state = games[req.params.gameID].getState();

  if (state !== null) {
    res.send({ status: "ok", data: state });
  } else {
    res.send({ status: "error", error: "No state initialized." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../../frontend/build/index.html"));
});

function initState(gameID: string) {
  const initialGameState = createInitialGameState(gameID);
  const gameStateStore = createStore(gameStateReducer);
  games[gameID] = gameStateStore;

  gameStateStore.subscribe(() => handleStateChanged(gameID));
  gameStateStore.dispatch(setState(initialGameState));
}

async function broadcastWS<T>(gameID: string, data: T) {
  const send = (ws: WebSocket, data: T) =>
    new Promise((resolve, reject) =>
      ws.send(JSON.stringify(data), err => (err ? reject(err) : resolve()))
    );

  const state = games[gameID].getState() as GameState;
  const playersWSs = state.players
    .map(player => usersWS[player.id].ws)
    .filter(Boolean)
    .filter(ws => ws.readyState === WebSocket.OPEN);
  await Promise.all(playersWSs.map(ws => send(ws, data)));
}

function handleStateChanged(gameID: string) {
  // broadcastWS(gameID, games[gameID].getState());
}

function handleRemovePlayer(ws: WebSocket) {
  const playerID = Object.keys(usersWS).find(sws => usersWS[sws].ws === ws);
  if (playerID) {
    handleDispatchAction(usersWS[playerID].gameID, ws, removePlayer(playerID));
  }
}

function handleDispatchAction(
  gameID: string,
  ws: WebSocket,
  action: GameStateAction
) {
  if (!games[gameID]) {
    initState(gameID);
  }

  if (action.type === "ADD_PLAYER") {
    usersWS[action.id] = { gameID, ws };
  } else if (action.type === "REMOVE_PLAYER") {
    delete usersWS[action.id];
  }

  games[gameID].dispatch(action);

  broadcastWS(gameID, games[gameID].getState());
}

wsServer.on("connection", ws => {
  ws.on("message", message => {
    try {
      const { gameID, action } = JSON.parse(message as string) as WSPayload;
      handleDispatchAction(gameID, ws, action);
    } catch (error) {
      console.error(error);
    }
  });

  ws.on("close", () => {
    handleRemovePlayer(ws);
  });
});

server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
