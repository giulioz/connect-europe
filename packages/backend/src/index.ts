import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import ep from "./safeEndpoints";

require("dotenv").config();

const host = process.env.SERVER_HOST ? process.env.SERVER_PORT : 8080;
const port = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT, 10)
  : 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors());

ep(app, "GET /test", (req, res) => {
  res.send(42);
});

app.listen(() => {
  console.log(`Listening on ${host}:${port}`);
});
