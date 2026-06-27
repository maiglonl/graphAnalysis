export const CONFIDENCE = {
  hammer: 68,
  shootingStar: 68,
  doji: 45,
  bullishEngulfing: 74,
  bearishEngulfing: 74,
  insideBar: 55,
  bullishFvg: 70,
  bearishFvg: 70,
  marketStructure: 58,
  bos: 76,
  choch: 72,
} as const;

export const ATR = {
  breakoutTolerance: 0.05,  // buffer aplicado sobre rompimentos de swing (BOS/CHOCH/estrutura)
  fvgGapMinFactor: 0.1,     // gap mínimo para FVG ser considerado válido
  fvgStopOffset: 0.1,       // distância do stop em relação à borda do gap
} as const;

export const TARGET_MULTIPLIERS = {
  standard: [2, 3] as const,
  insideBar: [1.5, 2] as const,
};

export const THRESHOLDS = {
  pinBarMaxBodyPct: 0.35,
  dojiMaxBodyPct: 0.1,
  pinBarMinShadowRatio: 2,       // sombra dominante ≥ 2× corpo
  pinBarMaxMinorShadow: 0.25,    // sombra menor ≤ 25% do corpo
  hammerMinClosePosition: 0.55,  // close deve estar na metade superior do range
  shootingStarMaxClosePosition: 0.45,
  engulfingMinBodyPct: 0.5,
  engulfingBodyGrowthFactor: 1.05,
} as const;

export const SCANNER = {
  minCandles: 50,
  waitConfidence: 45,
  maxConfidence: 95,
  maxConfluenceBonus: 15,
  confluenceBonusStep: 5,
} as const;

export const VOLUME = {
  highRelativeVolume: 1.5,
  lowRelativeVolume: 0.7,
} as const;

export const SCORING = {
  structureBreakScore: 10,
  marketStructureScore: 6,
  trendAlignmentBonus: 8,
  trendConflictPenalty: 8,
  conflictPenalty: 10,
  highVolumeBonus: 6,
  lowVolumePenalty: 4,
} as const;

export const HISTORICAL_SIMULATION = {
  maxLookaheadCandles: 24,
  minConfidence: 50,
} as const;

export const API = {
  candleLimit: 500,
  candleLimitMin: 50,
  candleLimitMax: 1000,
} as const;
