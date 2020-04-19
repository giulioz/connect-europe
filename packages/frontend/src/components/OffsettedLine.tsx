import React from "react";

export default function OffsettedLine({
  x1,
  x2,
  y1,
  y2,
  offset = 0,
  lengthOffset = 0,
  startPiece = false,
  endPiece = false,
  piecesSize = 15,
  ...rest
}: React.SVGProps<SVGLineElement> & {
  offset?: number;
  lengthOffset?: number;
  startPiece?: boolean;
  endPiece?: boolean;
  piecesSize?: number;
}) {
  const x1Parsed = x1 ? Number(x1) : 0;
  const y1Parsed = y1 ? Number(y1) : 0;
  const x2Parsed = x2 ? Number(x2) : 0;
  const y2Parsed = y2 ? Number(y2) : 0;
  const deltaX = x2Parsed - x1Parsed;
  const deltaY = y2Parsed - y1Parsed;
  const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const cosine = deltaX / delta;
  const sine = deltaY / delta;
  if (deltaY === 0) {
    return (
      <line
        x1={endPiece ? x2Parsed - piecesSize : x1Parsed + lengthOffset}
        y1={y1Parsed - offset}
        x2={startPiece ? x1Parsed + piecesSize : x2Parsed - lengthOffset}
        y2={y2Parsed - offset}
        {...rest}
      />
    );
  } else {
    if (startPiece) {
      return (
        <line
          x1={x1Parsed}
          y1={y1Parsed}
          x2={x1Parsed + cosine * piecesSize}
          y2={y1Parsed + sine * piecesSize}
          {...rest}
        />
      );
    } else if (endPiece) {
      return (
        <line
          x1={x2Parsed}
          y1={y2Parsed}
          x2={x2Parsed - cosine * piecesSize}
          y2={y2Parsed - sine * piecesSize}
          {...rest}
        />
      );
    } else {
      return (
        <line
          x1={x1Parsed + offset * cosine + cosine * lengthOffset}
          y1={y1Parsed - offset * sine + sine * lengthOffset}
          x2={x2Parsed + offset * cosine - cosine * lengthOffset}
          y2={y2Parsed - offset * sine - sine * lengthOffset}
          {...rest}
        />
      );
    }
  }
}
