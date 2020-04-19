import React, { useRef, useEffect, useState, useCallback } from "react";

export function useTimeout(timeout: number) {
  const [value, setValue] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    function jump() {
      setValue(true);
    }

    timeoutRef.current = setTimeout(jump, timeout);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [timeout]);

  return value;
}

export function calcDistancePointLine(
  x: number,
  y: number,
  pair: [[number, number], [number, number]]
) {
  const dx = pair[1][0] - pair[0][0];
  const dy = pair[1][1] - pair[0][1];
  const l2 = dx * dx + dy * dy;

  const t = ((x - pair[0][0]) * dx + (y - pair[0][1]) * dy) / l2;
  const tNorm = Math.max(0, Math.min(1, t));

  return (
    (x - (pair[0][0] + tNorm * dx)) ** 2 + (y - (pair[0][1] + tNorm * dy)) ** 2
  );
}

export function calcDistancePointPoint(
  x: number,
  y: number,
  point: [number, number]
) {
  return (x - point[0]) ** 2 + (y - point[1]) ** 2;
}
