export const EXTRA_CONFIDENCE = {
  invertedHammer: 64,
  hangingMan: 64,
  bullishHarami: 62,
  bearishHarami: 62,
  piercingLine: 66,
  darkCloudCover: 66,
  morningStar: 72,
  eveningStar: 72,
  tweezerBottom: 60,
  tweezerTop: 60,
} as const;

export const EXTRA_THRESHOLDS = {
  haramiMaxBodyFactor: 0.75,
  starMaxBodyPct: 0.35,
  starBodyGapFactor: 0.1,
  midpointFactor: 0.5,
  tweezerTolerancePct: 0.001,
} as const;
