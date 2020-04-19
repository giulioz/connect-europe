/*
  Contains functions used to create game objects and validate player's behavior.
  They can be used to check an action validity in server and client.
*/

import { v4 as uuid } from "uuid";

import { GameState, BoardPoint, Player, TurnState } from "./gameStateTypes";
import { maxPlayers, playerColorsArray, maxPenalityPoints } from "./config";
import {
  dijkstra,
  vertexKey,
  compareTwoPoints,
  randomPick,
  comparePoints,
  findMin,
} from "./utils";
import { points, City, cities, pointPairs, cityColorsArray } from "./map";
import { GameStateAction } from "./gameStateActions";

// Checks player's cities reachability, returns the players in a winning state
// We check by calculating the distance from the player startingPoint to his target cities, using dijkstra
export function findWinnerPlayers(state: GameState) {
  const winners = state.players.filter(player => {
    if (!player.startingPoint) {
      return false;
    }

    // Finds distances from the player's starting point
    const { distances } = dijkstra(points, state.board, player.startingPoint);

    const playerCities: City[] = player.targetCities.map(
      name => cities.find(city => city.name === name) as City
    );
    const citiesPositions = playerCities.map(city => city.position);

    // Every target city must be reachable from the player startingPoint
    return citiesPositions.every(posA => distances[vertexKey(posA)] < Infinity);
  });

  return winners;
}

// How many pieces do we need for a given rail segment?
export function calcNeededPieces(rail: [BoardPoint, BoardPoint]) {
  const destinationPair = pointPairs.find(
    pair =>
      compareTwoPoints([pair.from, pair.to], rail) ||
      compareTwoPoints([pair.to, pair.from], rail)
  );
  if (!destinationPair) {
    // Should never happen but...
    return false;
  }

  return destinationPair.double ? 2 : 1;
}

// Checks if a player can place a rail segment, does not check for pieces left
export function isSegmentReachable(
  state: GameState,
  rail: [BoardPoint, BoardPoint],
  playerID: Player["id"]
) {
  const player = state.players.find(player => player.id === playerID);
  if (!player || !player.startingPoint) {
    return false;
  }

  const { distances } = dijkstra(points, state.board, player.startingPoint);
  // We check distance with the two points of the new segment
  // At least one end has to be attached to the player's cluster
  const reachable =
    distances[vertexKey(rail[0])] < Infinity ||
    distances[vertexKey(rail[1])] < Infinity;

  return reachable;
}

// Gets random target cities for a new player, excluding the other player's one
export function reshufflePlayerTargets(players: Player[]) {
  // We simply choose the cities from the one no other players have
  const freeCities = cities.filter(city =>
    players.every(player => !player.targetCities.find(pc => pc === city.name))
  );

  return cityColorsArray.map(
    color => randomPick(freeCities.filter(city => city.color === color)).name
  );
}

// Creates a new player, populating the target cities
// Return false if there is no more space
export function createPlayer(
  state: GameState,
  id: Player["id"],
  name: Player["name"]
) {
  const cities = reshufflePlayerTargets(state.players);

  // The next player color is in order
  const freeColor = playerColorsArray[state.players.length];

  if (cities.length < cityColorsArray.length || !freeColor) {
    // No free color or cities! The player cannot enter
    // "abbiam fatto le squadre prima..." (cit.)
    return false;
  }

  return {
    name,
    id,
    color: freeColor,
    penalityPoints: 0,
    targetCities: cities,
    startingPoint: null,
  };
}

// Generates a new valid game id
export function generateGameID() {
  return btoa(Math.round(Math.random() * 50000).toString());
}

// Generates a new valid player id
export function generatePlayerID() {
  return uuid();
}

// Which player has to start the turn?
export function getInitialPlayerID(state: GameState) {
  return state.players[0].id;
}

// Is the player ko?
export function isPlayerGameOver(player: Player): boolean {
  return player.penalityPoints > maxPenalityPoints;
}

// Which player will do the next turn?
export function getTurnNextPlayerID(state: GameState, turnState: TurnState) {
  const stillAlivePlayers = state.players.filter(
    player => !isPlayerGameOver(player)
  );
  const currentPlayerIndex = stillAlivePlayers.findIndex(
    p => p.id === turnState.playerID
  );
  const nextPlayer =
    stillAlivePlayers[(currentPlayerIndex + 1) % stillAlivePlayers.length];
  return nextPlayer.id;
}

export function calculateEndTurnPenalityPoints(
  state: GameState,
  player: Player
): number {
  const boardPairs = pointPairs.map<[BoardPoint, BoardPoint]>(pair => [
    pair.from,
    pair.to,
  ]);
  const playerTargetCities = player.targetCities.map(
    name => cities.find(c => c.name === name) as City
  );

  const attachPoints = Array.from(
    new Set(
      state.board
        .reduce((prev: BoardPoint[], e) => [...prev, ...e], [])
        .map(vertexKey)
    )
  );

  const minDistances = playerTargetCities.map(city => {
    const { distances } = dijkstra(
      points,
      boardPairs,
      city.position,
      calcNeededPieces as any
    );

    const distancesToCluster = attachPoints.map(point => distances[point]);
    const minDistance = findMin(distancesToCluster);
    return minDistance;
  });

  return minDistances.reduce((a, b) => a + b, 0);
}

// The big game rules compliancy checker!
// "Can a given player perform that action in that state?"
export function canPerformAction(
  state: GameState,
  action: GameStateAction,
  playerID: Player["id"]
): boolean {
  switch (action.type) {
    case "ADD_PLAYER": {
      // Maximum of ${maxPlayers} players. Sorry!
      const alreadyExists = state.players.some(
        player => player.id === action.id || player.name === action.name
      );

      return (
        !alreadyExists &&
        state.players.length + 1 <= maxPlayers &&
        state.currentState.state === "WaitingForPlayers"
      );
    }

    case "REMOVE_PLAYER":
      // We can remove only ourselves
      return action.id === playerID;

    case "SET_PLAYER_INITIAL_POINT": {
      // We can set only our own point, at the start of the game or at the end of a round
      const alreadySet = state.players.some(
        player =>
          player.startingPoint &&
          comparePoints(player.startingPoint, action.position)
      );

      return (
        !alreadySet &&
        action.id === playerID &&
        (state.currentState.state === "WaitingForPlayers" ||
          state.currentState.state === "EndRound")
      );
    }

    case "START_GAME": {
      const everybodyHasStartingPoint = state.players.every(
        player => player.startingPoint !== null
      );

      // Only the initiator can start the game
      return (
        playerID === state.initiatorID &&
        everybodyHasStartingPoint &&
        (state.currentState.state === "WaitingForPlayers" ||
          state.currentState.state === "EndRound")
      );
    }

    case "PLACE_RAIL": {
      // We must be in a turn
      if (
        state.currentState.state !== "Turn" ||
        state.currentState.playerID !== playerID
      ) {
        return false;
      }

      const neededPieces = calcNeededPieces(action.rail);
      if (neededPieces === false) {
        // The passed rail segment must be valid
        return false;
      }

      // We must have at least the needed pieces and it should be connected
      const enoughPieces = state.currentState.railsLeft - neededPieces >= 0;
      return enoughPieces && isSegmentReachable(state, action.rail, playerID);
    }

    default:
      return false;
  }
}
