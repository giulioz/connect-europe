import { Endpoints } from "./interopTypes";
import { BoardPoint } from "./gameStateTypes";

export type ParamsType<K extends keyof Endpoints> = Endpoints[K]["params"];
export type ResType<K extends keyof Endpoints> = Endpoints[K]["res"];
export type ReqType<K extends keyof Endpoints> = Endpoints[K]["req"];

export function withParameters<K extends keyof Endpoints>(
  endpoint: K,
  params: ParamsType<K>
) {
  const url = endpoint
    .split(" ")
    .slice(1)
    .join(" ");

  return url
    .split("/")
    .map(part => {
      if (part.startsWith(":")) {
        return params[part.substring(1) as keyof ParamsType<K>];
      } else {
        return part;
      }
    })
    .join("/");
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function comparePoints(a: BoardPoint, b: BoardPoint) {
  return a[0] === b[0] && a[1] === b[1];
}

export function compareTwoPoints(
  a: [BoardPoint, BoardPoint],
  b: [BoardPoint, BoardPoint]
) {
  return (
    a[0][0] === b[0][0] &&
    a[0][1] === b[0][1] &&
    a[1][0] === b[1][0] &&
    a[1][1] === b[1][1]
  );
}

export function uniquePairs(pairs: [BoardPoint, BoardPoint][]) {
  return pairs.reduce(
    (acc: [BoardPoint, BoardPoint][], pair) =>
      !acc.find(
        accElement =>
          accElement[0][0] === pair[0][0] &&
          accElement[0][1] === pair[0][1] &&
          accElement[1][0] === pair[1][0] &&
          accElement[1][1] === pair[1][1]
      )
        ? [...acc, pair]
        : acc,
    []
  );
}

export function findMin(arr: number[]) {
  let min = Infinity;
  arr.forEach(e => {
    if (e < min) min = e;
  });

  return min;
}

export function vertexKey(vertex: BoardPoint) {
  return `${vertex[0]},${vertex[1]}`;
}

export function popMin<T>(arr: [T, number][]) {
  let best = Infinity;
  let bestI = 0;
  arr.forEach(([v, k], i) => {
    if (k < best) {
      bestI = i;
    }
  });

  const [value, k] = arr[bestI];
  arr.splice(bestI, 1);
  return value;
}

export function neighs(vertex: BoardPoint, edges: [BoardPoint, BoardPoint][]) {
  return [
    ...edges.filter(e => comparePoints(e[0], vertex)).map(e => e[1]),
    ...edges.filter(e => comparePoints(e[1], vertex)).map(e => e[0]),
  ];
}

export function dijkstra(
  vertices: BoardPoint[],
  edges: [BoardPoint, BoardPoint][],
  startVertex: BoardPoint,
  calcWeight: (p: [BoardPoint, BoardPoint]) => number = () => 1
) {
  const distances: { [key: string]: number } = {};
  const visitedVertices: { [key: string]: BoardPoint } = {};
  const previousVertices: { [key: string]: null | BoardPoint } = {};
  const queue: [BoardPoint, number][] = [];

  vertices.forEach(vertex => {
    distances[vertexKey(vertex)] = Infinity;
    previousVertices[vertexKey(vertex)] = null;
  });

  distances[vertexKey(startVertex)] = 0;

  queue.push([startVertex, distances[vertexKey(startVertex)]]);

  while (queue.length > 0) {
    const currentVertex = popMin(queue);

    neighs(currentVertex, edges).forEach(neighbor => {
      if (!visitedVertices[vertexKey(neighbor)]) {
        const existingDistanceToNeighbor = distances[vertexKey(neighbor)];
        const distanceToNeighborFromCurrent =
          distances[vertexKey(currentVertex)] +
          calcWeight([currentVertex, neighbor]);

        if (distanceToNeighborFromCurrent < existingDistanceToNeighbor) {
          distances[vertexKey(neighbor)] = distanceToNeighborFromCurrent;

          const foundI = queue.findIndex(([v]) => comparePoints(v, neighbor));
          if (foundI !== -1) {
            queue[foundI] = [neighbor, distances[vertexKey(neighbor)]];
          }

          previousVertices[vertexKey(neighbor)] = currentVertex;
        }

        if (!queue.find(([v]) => comparePoints(v, neighbor))) {
          queue.push([neighbor, distances[vertexKey(neighbor)]]);
        }
      }
    });

    visitedVertices[vertexKey(currentVertex)] = currentVertex;
  }

  return {
    distances,
    previousVertices,
  };
}
