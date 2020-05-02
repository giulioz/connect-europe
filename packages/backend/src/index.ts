import GamesManagement from "./GamesManagement";
import { initApi } from "./httpApi";
import { initWS } from "./wsApi";

require("dotenv").config();
const host = process.env.SERVER_HOST ? process.env.SERVER_HOST : "0.0.0.0";
const port = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT, 10)
  : 8080;

const gamesManager = new GamesManagement();

const app = initApi(gamesManager);
const server = initWS(app, gamesManager);

server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
