import { Endpoints, WSPayload } from "./interopTypes";
import {
  ParamsType,
  randomPick,
  ReqType,
  ResType,
  sleep,
  withParameters,
} from "./utils";
import {
  BoardPoint,
  CityName,
  CurrentState,
  GameState,
  Player,
  PlayerColors,
  PlayerID,
} from "./gameStateTypes";
import { isSegmentReachable, canPerformAction } from "./gameRules";
import { playerColorsArray } from "./config";
import {
  cities,
  City,
  CityColors,
  cityColorsArray,
  pointPairs,
  points,
} from "./map";
import { initialGameState, gameStateReducer } from "./gameStateManagement";
import {
  addPlayer,
  GameStateAction,
  placeRail,
  removePlayer,
  setPlayerInitialPoint,
  setState,
  startGame,
} from "./gameStateActions";

export {
  addPlayer,
  isSegmentReachable,
  canPerformAction,
  BoardPoint,
  cities,
  City,
  CityColors,
  cityColorsArray,
  CityName,
  initialGameState,
  CurrentState,
  Endpoints,
  GameState,
  GameStateAction,
  gameStateReducer,
  ParamsType,
  placeRail,
  Player,
  PlayerColors,
  playerColorsArray,
  PlayerID,
  pointPairs,
  points,
  randomPick,
  removePlayer,
  ReqType,
  ResType,
  setPlayerInitialPoint,
  setState,
  sleep,
  startGame,
  withParameters,
  WSPayload,
};
