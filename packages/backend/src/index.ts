import http from "http";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket from "ws";

import { WSPayload } from "@trans-europa/common";
import ep from "./safeEndpoints";
import GamesManagement from "./GamesManagement";

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

const gamesManager = new GamesManagement();

// Static endpoint to get the current game state
ep(app, "GET /state/:gameID", (req, res) => {
  const state = gamesManager.tryGetGameState(req.params.gameID);

  if (state !== null) {
    res.send({ status: "ok", data: state });
  } else {
    res.send({ status: "error", error: "No state initialized." });
  }
});

// Serve the index page on every other route, to support SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../../frontend/build/index.html"));
});

wsServer.on("connection", ws => {
  ws.on("message", message => {
    try {
      // We assume the payload is valid
      const { gameID, action } = JSON.parse(message as string) as WSPayload;
      gamesManager.handleDispatchAction(gameID, ws, action);
    } catch (error) {
      // If not, we fail miserably, logging an error
      console.error(error);
    }
  });

  ws.on("close", () => {
    gamesManager.handleRemovePlayer(ws);
  });
});

server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
