import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket from "ws";
import { createStore } from "redux";

import {
  createInitialGameState,
  createGameStateReducer,
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
const gameStateReducer = createGameStateReducer(initialGameState);
const gameStateStore = createStore(gameStateReducer);

ep(app, "GET /initialState", (req, res) => {
  res.send({ status: "ok", data: gameStateStore.getState() });
});

wsServer.on("connection", ws => {});

server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
