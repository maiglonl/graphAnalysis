export const RANGE_PATTERN_CONFIDENCE = {
  ascendingTriangle: 72,
  descendingTriangle: 72,
  symmetricalTriangle: 70,
  risingWedge: 66,
  fallingWedge: 66,
  rectangleBreakoutUp: 64,
  rectangleBreakoutDown: 64,
  rangeRejectionHigh: 58,
  rangeRejectionLow: 58,
  channelBreakout: 66,
} as const;

export const RANGE_PATTERN_THRESHOLDS = {
  rangePatternLookback: 12,
  rangeMaxHeightPct: 0.08,
  rangeRejectionTolerancePct: 0.01,
  trianglePatternLookback: 12,
  triangleFlatSideTolerancePct: 0.015,
  triangleSlopeMinPct: 0.01,
  wedgePatternLookback: 12,
  wedgeSlopeMinPct: 0.01,
  channelPatternLookback: 12,
  channelSlopeMinPct: 0.01,
  breakoutThresholdPct: 0.002,
  convergenceFactor: 0.85,
} as const;
