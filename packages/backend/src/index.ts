import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket from "ws";
import { createStore } from "redux";

import {
  createInitialGameState,
  setState,
  gameStateReducer,
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

const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

const initialGameState = createInitialGameState("giulio");
const gameStateStore = createStore(gameStateReducer);
gameStateStore.dispatch(setState(initialGameState));

ep(app, "GET /initialState", (req, res) => {
  const state = gameStateStore.getState();
  if (state !== null) {
    res.send({ status: "ok", data: state });
  } else {
    res.send({ status: "error", error: "No state initialized." });
  }
});

wsServer.on("connection", ws => {});

server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
