import type { Candle, PatternSignal, SuggestionScoreBreakdown, TradeSuggestion } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum, TradeActionEnum } from '#shared/types/market';
import { ScanContext } from '#shared/utils/scanContext';
import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { HammerDetector } from '#shared/utils/detectors/candle/hammer';
import { InvertedHammerDetector } from '#shared/utils/detectors/candle/invertedHammer';
import { HangingManDetector } from '#shared/utils/detectors/candle/hangingMan';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { DojiDetector } from '#shared/utils/detectors/candle/doji';
import { BullishEngulfingDetector } from '#shared/utils/detectors/candle/bullishEngulfing';
import { BearishEngulfingDetector } from '#shared/utils/detectors/candle/bearishEngulfing';
import { BullishHaramiDetector } from '#shared/utils/detectors/candle/bullishHarami';
import { BearishHaramiDetector } from '#shared/utils/detectors/candle/bearishHarami';
import { InsideBarDetector } from '#shared/utils/detectors/candle/insideBar';
import { BullishFvgDetector } from '#shared/utils/detectors/candle/bullishFvg';
import { BearishFvgDetector } from '#shared/utils/detectors/candle/bearishFvg';
import { MarketStructureDetector } from '#shared/utils/detectors/structure/marketStructure';
import { BosDetector } from '#shared/utils/detectors/structure/bos';
import { ChochDetector } from '#shared/utils/detectors/structure/choch';
import { SCANNER, SCORING, VOLUME } from '#shared/utils/detectors/constants';

const EMPTY_SCORE_BREAKDOWN: SuggestionScoreBreakdown = {
  patternScore: 0,
  structureScore: 0,
  trendScore: 0,
  volumeScore: 0,
  confluenceBonus: 0,
  conflictPenalty: 0,
};

export class Scanner {
  private readonly detectors: PatternDetector[];

  constructor(detectors: PatternDetector[]) {
    this.detectors = detectors;
  }

  scan(candles: Candle[]): PatternSignal[] {
    if (!this.isValidInput(candles)) return [];
    const ctx = new ScanContext(candles);
    const raw = this.detectors.flatMap((detector) => detector.detect(ctx));
    return this.deduplicateStructureBreaks(raw);
  }

  // CHOCH é uma especialização de BOS: se ambos dispararem na mesma direção,
  // suprime o BOS para evitar dupla contagem que infla a confluência.
  private deduplicateStructureBreaks(patterns: PatternSignal[]): PatternSignal[] {
    const hasBullishChoch = patterns.some((p) => p.id === PatternIdEnum.BullishChoch);
    const hasBearishChoch = patterns.some((p) => p.id === PatternIdEnum.BearishChoch);

    if (!hasBullishChoch && !hasBearishChoch) return patterns;

    return patterns.filter((p) => {
      if (hasBullishChoch && p.id === PatternIdEnum.BullishBos) return false;
      if (hasBearishChoch && p.id === PatternIdEnum.BearishBos) return false;
      return true;
    });
  }

  private isValidInput(candles: Candle[]): boolean {
    if (candles.length < SCANNER.minCandles) return false;
    return candles.every((c) => c.high >= c.low && c.close >= 0 && c.open >= 0);
  }
}

export class SuggestionBuilder {
  build(candles: Candle[], patterns: PatternSignal[]): TradeSuggestion {
    if (candles.length === 0 || patterns.length === 0) {
      return {
        action: TradeActionEnum.None,
        confidence: 0,
        reasons: [],
        scoreBreakdown: EMPTY_SCORE_BREAKDOWN,
      };
    }

    const bullish = patterns.filter((p) => p.direction === PatternDirectionEnum.Bullish);
    const bearish = patterns.filter((p) => p.direction === PatternDirectionEnum.Bearish);
    const bullishScore = bullish.reduce((sum, p) => sum + p.confidence, 0);
    const bearishScore = bearish.reduce((sum, p) => sum + p.confidence, 0);

    const direction =
      bullishScore > bearishScore
        ? PatternDirectionEnum.Bullish
        : bearishScore > bullishScore
          ? PatternDirectionEnum.Bearish
          : PatternDirectionEnum.Neutral;

    if (direction === PatternDirectionEnum.Neutral) {
      return {
        action: TradeActionEnum.Wait,
        confidence: SCANNER.waitConfidence,
        reasons: patterns.map((p) => p.id),
        scoreBreakdown: {
          ...EMPTY_SCORE_BREAKDOWN,
          conflictPenalty: this.calculateConflictPenalty(bullish, bearish),
        },
      };
    }

    const selectedPatterns = direction === PatternDirectionEnum.Bullish ? bullish : bearish;
    const strongestPattern = [...selectedPatterns].sort((a, b) => b.confidence - a.confidence)[0];

    if (!strongestPattern) {
      return {
        action: TradeActionEnum.Wait,
        confidence: SCANNER.waitConfidence,
        reasons: patterns.map((p) => p.id),
        scoreBreakdown: EMPTY_SCORE_BREAKDOWN,
      };
    }

    const scoreBreakdown = this.buildScoreBreakdown(candles, selectedPatterns, bullish, bearish, direction);
    const confidence = this.calculateConfidence(scoreBreakdown);
    const action = direction === PatternDirectionEnum.Bullish ? TradeActionEnum.Buy : TradeActionEnum.Sell;

    return {
      action,
      confidence,
      entry: strongestPattern.entry,
      stop: strongestPattern.stop,
      targets: strongestPattern.targets,
      reasons: selectedPatterns.map((p) => p.id),
      scoreBreakdown,
    };
  }

  private buildScoreBreakdown(
    candles: Candle[],
    selectedPatterns: PatternSignal[],
    bullish: PatternSignal[],
    bearish: PatternSignal[],
    direction: PatternDirectionEnum,
  ): SuggestionScoreBreakdown {
    const ctx = new ScanContext(candles);
    const patternScore = this.calculatePatternScore(selectedPatterns);
    const confluenceBonus = this.calculateConfluenceBonus(selectedPatterns);
    const structureScore = this.calculateStructureScore(selectedPatterns);
    const trendScore = this.calculateTrendScore(ctx, direction);
    const volumeScore = this.calculateVolumeScore(ctx, selectedPatterns);
    const conflictPenalty = this.calculateConflictPenalty(bullish, bearish);

    return {
      patternScore,
      structureScore,
      trendScore,
      volumeScore,
      confluenceBonus,
      conflictPenalty,
    };
  }

  private calculatePatternScore(patterns: PatternSignal[]): number {
    if (patterns.length === 0) return 0;

    return Math.round(patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length);
  }

  private calculateConfluenceBonus(patterns: PatternSignal[]): number {
    return Math.min(
      SCANNER.maxConfluenceBonus,
      Math.max(0, patterns.length - 1) * SCANNER.confluenceBonusStep,
    );
  }

  private calculateStructureScore(patterns: PatternSignal[]): number {
    if (patterns.some((pattern) => this.isStructureBreakPattern(pattern))) {
      return SCORING.structureBreakScore;
    }

    if (patterns.some((pattern) => this.isMarketStructurePattern(pattern))) {
      return SCORING.marketStructureScore;
    }

    return 0;
  }

  private calculateTrendScore(ctx: ScanContext, direction: PatternDirectionEnum): number {
    const trend = ctx.trend();

    if (trend === StructureTrendEnum.Neutral) return 0;
    if (trend === StructureTrendEnum.Bullish && direction === PatternDirectionEnum.Bullish) return SCORING.trendAlignmentBonus;
    if (trend === StructureTrendEnum.Bearish && direction === PatternDirectionEnum.Bearish) return SCORING.trendAlignmentBonus;

    return -SCORING.trendConflictPenalty;
  }

  private calculateVolumeScore(ctx: ScanContext, patterns: PatternSignal[]): number {
    if (!patterns.some((pattern) => this.needsVolumeConfirmation(pattern))) return 0;

    if (ctx.currentRelativeVolume >= VOLUME.highRelativeVolume) {
      return SCORING.highVolumeBonus;
    }

    if (ctx.currentRelativeVolume > 0 && ctx.currentRelativeVolume <= VOLUME.lowRelativeVolume) {
      return -SCORING.lowVolumePenalty;
    }

    return 0;
  }

  private calculateConflictPenalty(bullish: PatternSignal[], bearish: PatternSignal[]): number {
    if (bullish.length === 0 || bearish.length === 0) return 0;

    return SCORING.conflictPenalty;
  }

  private calculateConfidence(scoreBreakdown: SuggestionScoreBreakdown): number {
    const confidence =
      scoreBreakdown.patternScore +
      scoreBreakdown.structureScore +
      scoreBreakdown.trendScore +
      scoreBreakdown.volumeScore +
      scoreBreakdown.confluenceBonus -
      scoreBreakdown.conflictPenalty;

    return Math.min(SCANNER.maxConfidence, Math.max(SCANNER.waitConfidence, Math.round(confidence)));
  }

  private needsVolumeConfirmation(pattern: PatternSignal): boolean {
    return (
      this.isStructureBreakPattern(pattern) ||
      pattern.id === PatternIdEnum.BullishFvg ||
      pattern.id === PatternIdEnum.BearishFvg ||
      pattern.id === PatternIdEnum.BullishEngulfing ||
      pattern.id === PatternIdEnum.BearishEngulfing
    );
  }

  private isStructureBreakPattern(pattern: PatternSignal): boolean {
    return (
      pattern.id === PatternIdEnum.BullishBos ||
      pattern.id === PatternIdEnum.BearishBos ||
      pattern.id === PatternIdEnum.BullishChoch ||
      pattern.id === PatternIdEnum.BearishChoch
    );
  }

  private isMarketStructurePattern(pattern: PatternSignal): boolean {
    return (
      pattern.id === PatternIdEnum.HigherHigh ||
      pattern.id === PatternIdEnum.HigherLow ||
      pattern.id === PatternIdEnum.LowerHigh ||
      pattern.id === PatternIdEnum.LowerLow
    );
  }
}

const defaultScanner = new Scanner([
  new HammerDetector(),
  new InvertedHammerDetector(),
  new HangingManDetector(),
  new ShootingStarDetector(),
  new DojiDetector(),
  new BullishEngulfingDetector(),
  new BearishEngulfingDetector(),
  new BullishHaramiDetector(),
  new BearishHaramiDetector(),
  new InsideBarDetector(),
  new BullishFvgDetector(),
  new BearishFvgDetector(),
  new MarketStructureDetector(),
  new BosDetector(),
  new ChochDetector(),
]);

const defaultSuggestionBuilder = new SuggestionBuilder();

export function scanPatterns(candles: Candle[]): PatternSignal[] {
  return defaultScanner.scan(candles);
}

export function buildSuggestion(candles: Candle[], patterns: PatternSignal[]): TradeSuggestion {
  return defaultSuggestionBuilder.build(candles, patterns);
}
