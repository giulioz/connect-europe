import { v4 as uuid } from "uuid";

import {
  GameState,
  playerColorsArray,
  maxPlayers,
  BoardPoint,
  defaultRailsLeft,
} from "./gameTypes";
import { GameStateAction } from "./gameStateActions";
import { cityColorsArray, cities, points, City, pointPairs } from "./map";
import {
  floydWarshall,
  randomPick,
  uniquePairs,
  compareTwoPoints,
} from "./utils";

export function createInitialGameState(initiatorName: string): GameState {
  const gameID = uuid();
  const initiatorID = uuid();

  return {
    gameID,
    currentState: { state: "WaitingForPlayers" },
    initiatorID,
    lastWinnerID: null,
    players: [
      {
        name: initiatorName,
        id: initiatorID,
        color: playerColorsArray[0],
        penalityPoints: 0,
        targetCities: cityColorsArray.map(
          color => randomPick(cities.filter(city => city.color === color)).name
        ),
        startingPoint: null,
      },
    ],
    board: [],
  };
}

export function createPlayer(state: GameState, name: string) {
  const playerID = uuid();

  const freeCities = cities.filter(city =>
    state.players.every(
      player => !player.targetCities.find(pc => pc === city.name)
    )
  );
  const freeColor = playerColorsArray[state.players.length];

  if (freeCities.length < cityColorsArray.length || !freeColor) {
    return false;
  }

  return {
    name,
    id: playerID,
    color: freeColor,
    penalityPoints: 0,
    targetCities: cityColorsArray.map(
      color => randomPick(freeCities.filter(city => city.color === color)).name
    ),
    startingPoint: null,
  };
}

export function findWinnerPlayers(state: GameState) {
  const { distances } = floydWarshall(points, state.board);

  return state.players.filter(player => {
    const playerCities: City[] = player.targetCities.map(
      name => cities.find(city => city.name === name) as City
    );
    const citiesPositions = playerCities.map(city => city.position);
    return false;
  });
}

export function calcNeededPieces(rail: [BoardPoint, BoardPoint]) {
  const destinationPair = pointPairs.find(pair =>
    compareTwoPoints([pair.from, pair.to], rail)
  );
  if (!destinationPair) {
    return false;
  }
  return destinationPair.double ? 2 : 1;
}

export function canPerformAction(
  state: GameState,
  action: GameStateAction
): boolean {
  switch (action.type) {
    case "ADD_PLAYER":
      return (
        state.players.length + 1 < maxPlayers &&
        state.currentState.state === "WaitingForPlayers"
      );

    case "REMOVE_PLAYER":
      return true;

    case "SET_PLAYER_INITIAL_POINT":
      return true;

    case "START_GAME":
      return true;

    case "PLACE_RAIL": {
      const neededPieces = calcNeededPieces(action.rail);
      return (
        neededPieces !== false &&
        state.currentState.state === "Turn" &&
        state.currentState.railsLeft >= neededPieces
      );
    }
  }
}

export function gameStateReducer(
  state: GameState,
  action: GameStateAction
): GameState {
  if (!canPerformAction(state, action)) {
    return state;
  }

  switch (action.type) {
    case "ADD_PLAYER": {
      const player = createPlayer(state, action.name);
      return player
        ? {
            ...state,
            players: [...state.players, player],
          }
        : state;
    }

    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.id),
      };

    case "SET_PLAYER_INITIAL_POINT":
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.id
            ? { ...player, startingPoint: action.position }
            : player
        ),
      };

    case "START_GAME":
      return {
        ...state,
        currentState: {
          state: "Turn",
          playerID: state.initiatorID,
          railsLeft: defaultRailsLeft,
        },
      };

    case "PLACE_RAIL": {
      const neededPieces = calcNeededPieces(action.rail);
      if (neededPieces !== false && state.currentState.state === "Turn") {
        const newRailsLeft = state.currentState.railsLeft - neededPieces;
        const newTurn = newRailsLeft <= 0;
        const newBoard = uniquePairs([...state.board, action.rail]);
        const currentPlayerID = state.currentState.playerID;
        const nextPlayer =
          state.players[
            state.players.findIndex(p => p.id === currentPlayerID) + 1
          ];

        return {
          ...state,
          currentState: newTurn
            ? {
                ...state.currentState,
                railsLeft: defaultRailsLeft,
                playerID: nextPlayer.id,
              }
            : {
                ...state.currentState,
                railsLeft: newRailsLeft,
              },
          board: newBoard,
        };
      } else {
        return state;
      }
    }
  }
}

export const createGameStateReducer = (initialState: GameState) => (
  state: GameState = initialState,
  action: GameStateAction
) => gameStateReducer(state, action);
