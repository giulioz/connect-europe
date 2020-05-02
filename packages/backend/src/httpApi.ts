import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { generateGameID } from "@connect-europe/common/src";
import { configEndpoints } from "./utils/safeEndpoints";
import GamesManagement from "./GamesManagement";

export function initApi(gamesManager: GamesManagement) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  configEndpoints(app, {
    // Get the current game state
    "GET /state/:gameID": (req, res) => {
      const state = gamesManager.tryGetGameState(req.params.gameID);

      if (state !== null) {
        res.send({ status: "ok", data: state });
      } else {
        res.send({ status: "error", error: "No state initialized." });
      }
    },

    // Create a new game id
    "GET /newGameID": (req, res) => {
      const gameID = generateGameID();
      res.send({ status: "ok", data: gameID });
    },
  });

  return app;
}
