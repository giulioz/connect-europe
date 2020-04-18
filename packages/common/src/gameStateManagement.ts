import { v4 as uuid } from "uuid";

import {
  GameState,
  playerColorsArray,
  maxPlayers,
  BoardPoint,
  defaultRailsLeft,
  Player,
} from "./gameTypes";
import { GameStateAction } from "./gameStateActions";
import { cityColorsArray, cities, points, City, pointPairs } from "./map";
import {
  floydWarshall,
  randomPick,
  uniquePairs,
  compareTwoPoints,
  dijkstra,
  vertexKey,
} from "./utils";

export function createInitialGameState(gameID: string): GameState {
  return {
    gameID,
    currentState: { state: "WaitingForPlayers" },
    initiatorID: null,
    lastWinnerID: null,
    players: [],
    board: [],
  };
}

export function createPlayer(
  state: GameState,
  id: Player["id"],
  name: Player["name"]
) {
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
    id,
    color: freeColor,
    penalityPoints: 0,
    targetCities: cityColorsArray.map(
      color => randomPick(freeCities.filter(city => city.color === color)).name
    ),
    startingPoint: null,
  };
}

export function findWinnerPlayers(state: GameState) {
  const winners = state.players.filter(player => {
    if (!player.startingPoint) {
      return false;
    }

    const { distances } = dijkstra(points, state.board, player.startingPoint);
    const playerCities: City[] = player.targetCities.map(
      name => cities.find(city => city.name === name) as City
    );
    const citiesPositions = playerCities.map(city => city.position);
    return citiesPositions.every(posA => distances[vertexKey(posA)] < Infinity);
  });

  return winners;
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

export function canPlaceRail(
  state: GameState,
  rail: [BoardPoint, BoardPoint],
  playerID: Player["id"]
) {
  const player = state.players.find(player => player.id === playerID);
  if (!player || !player.startingPoint) {
    return false;
  }

  const { distances } = dijkstra(points, state.board, player.startingPoint);
  const reachable =
    distances[vertexKey(rail[0])] < Infinity ||
    distances[vertexKey(rail[1])] < Infinity;

  return reachable;
}

export function canPerformAction(
  state: GameState | null,
  action: GameStateAction
): state is GameState {
  if (action.type === "SET_STATE") {
    return true;
  }

  if (state === null) {
    return false;
  }

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
  state: GameState | null = null,
  action: GameStateAction
): GameState | null {
  if (!canPerformAction(state, action)) {
    return state;
  }

  switch (action.type) {
    case "SET_STATE":
      return action.state;

    case "ADD_PLAYER": {
      const player = createPlayer(state, action.id, action.name);
      return player
        ? {
            ...state,
            initiatorID: !state.initiatorID ? player.id : state.initiatorID,
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
      return state.initiatorID
        ? {
            ...state,
            currentState: {
              state: "Turn",
              playerID: state.initiatorID,
              railsLeft: defaultRailsLeft,
            },
          }
        : state;

    case "PLACE_RAIL": {
      const neededPieces = calcNeededPieces(action.rail);
      if (neededPieces !== false && state.currentState.state === "Turn") {
        const newRailsLeft = state.currentState.railsLeft - neededPieces;
        const newTurn = newRailsLeft <= 0;
        const newBoard = uniquePairs([...state.board, action.rail]);
        const currentPlayerID = state.currentState.playerID;
        const nextPlayer =
          state.players[
            (state.players.findIndex(p => p.id === currentPlayerID) + 1) %
              state.players.length
          ];

        const newState = {
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

        const winning = findWinnerPlayers(newState);
        if (winning.length > 0) {
          const winner = winning[0];
          return {
            ...newState,
            lastWinnerID: winner.id,
            currentState: {
              state: "EndRound",
              winnerID: winner.id,
            },
          };
        } else {
          return newState;
        }
      } else {
        return state;
      }
    }
  }
}
