import { createServer } from "http";
import { Application } from "express";
import WebSocket from "ws";

import { WSPayload } from "@connect-europe/common";
import GamesManagement from "./GamesManagement";

export function initWS(app: Application, gamesManager: GamesManagement) {
  const server = createServer(app);
  const wsServer = new WebSocket.Server({ server });

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

  return server;
}
