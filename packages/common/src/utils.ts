import Endpoints from "./Endpoints";
import { BoardPoint } from "./gameTypes";

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

export function floydWarshall(
  vertices: BoardPoint[],
  edges: [BoardPoint, BoardPoint][]
) {
  const nextVertices: (BoardPoint | null)[][] = Array(vertices.length)
    .fill(null)
    .map(() => {
      return Array(vertices.length).fill(null);
    });

  const distances: number[][] = Array(vertices.length)
    .fill(Infinity)
    .map(() => {
      return Array(vertices.length).fill(Infinity);
    });

  vertices.forEach((startVertex, startIndex) => {
    vertices.forEach((endVertex, endIndex) => {
      if (startVertex === endVertex) {
        distances[startIndex][endIndex] = 0;
      } else {
        const edge = edges.find(([from, to]) =>
          compareTwoPoints([from, to], [startVertex, endVertex])
        );

        if (edge) {
          distances[startIndex][endIndex] = 1;
          nextVertices[startIndex][endIndex] = startVertex;
        } else {
          distances[startIndex][endIndex] = Infinity;
        }
      }
    });
  });

  vertices.forEach((middleVertex, middleIndex) => {
    vertices.forEach((startVertex, startIndex) => {
      vertices.forEach((endVertex, endIndex) => {
        const distViaMiddle =
          distances[startIndex][middleIndex] + distances[middleIndex][endIndex];

        if (distances[startIndex][endIndex] > distViaMiddle) {
          distances[startIndex][endIndex] = distViaMiddle;
          nextVertices[startIndex][endIndex] = middleVertex;
        }
      });
    });
  });

  return { distances, nextVertices };
}
