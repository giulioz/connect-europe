import {
  createInitialGameState,
  createPlayer,
} from "../src/gameStateManagement";
import { playerColorsArray } from "../src/gameTypes";
import { cityColorsArray, cities, City } from "../src/map";

test("createInitialGameState creates an initial valid state", () => {
  const state = createInitialGameState();

  expect(state).toMatchObject({
    currentState: { state: "WaitingForPlayers" },
    initiatorID: null,
    lastWinnerID: null,
    players: [],
    board: [],
  });

  expect(state.initiatorID).toBe(state.players[0].id);

  const firstPlayerCities = state.players[0].targetCities.map(
    city => cities.find(c => c.name === city) as City
  );
  expect(firstPlayerCities.filter(Boolean)).toHaveLength(
    cityColorsArray.length
  );
  expect(Array.from(new Set(firstPlayerCities.map(c => c.color)))).toHaveLength(
    cityColorsArray.length
  );
});

test("createPlayer creates a valid player", () => {
  const state = createInitialGameState();

  const playerName = "Mario";
  const player = createPlayer(state, playerName);

  expect(player).toBeTruthy();

  if (player !== false) {
    expect(player).toMatchObject({
      name: playerName,
      color: playerColorsArray[1],
      penalityPoints: 0,
      startingPoint: null,
    });

    const playerCities = state.players[0].targetCities.map(
      city => cities.find(c => c.name === city) as City
    );
    expect(playerCities.filter(Boolean)).toHaveLength(cityColorsArray.length);
    expect(Array.from(new Set(playerCities.map(c => c.color)))).toHaveLength(
      cityColorsArray.length
    );
    expect(
      Array.from(
        new Set([...player.targetCities, ...state.players[0].targetCities])
      )
    ).toHaveLength(cityColorsArray.length * 2);
  }
});
