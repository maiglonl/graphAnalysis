import type { Candle, PatternSignal, TradeSuggestion } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, TradeActionEnum } from '#shared/types/market';
import { ScanContext } from '#shared/utils/scanContext';
import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { HammerDetector } from '#shared/utils/detectors/candle/hammer';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { DojiDetector } from '#shared/utils/detectors/candle/doji';
import { BullishEngulfingDetector } from '#shared/utils/detectors/candle/bullishEngulfing';
import { BearishEngulfingDetector } from '#shared/utils/detectors/candle/bearishEngulfing';
import { InsideBarDetector } from '#shared/utils/detectors/candle/insideBar';
import { BullishFvgDetector } from '#shared/utils/detectors/candle/bullishFvg';
import { BearishFvgDetector } from '#shared/utils/detectors/candle/bearishFvg';
import { MarketStructureDetector } from '#shared/utils/detectors/structure/marketStructure';
import { BosDetector } from '#shared/utils/detectors/structure/bos';
import { ChochDetector } from '#shared/utils/detectors/structure/choch';
import { SCANNER } from '#shared/utils/detectors/constants';

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
      return { action: TradeActionEnum.None, confidence: 0, reasons: [] };
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
      return { action: TradeActionEnum.Wait, confidence: SCANNER.waitConfidence, reasons: patterns.map((p) => p.id) };
    }

    const selectedPatterns = direction === PatternDirectionEnum.Bullish ? bullish : bearish;
    const strongestPattern = selectedPatterns.sort((a, b) => b.confidence - a.confidence)[0];

    if (!strongestPattern) {
      return { action: TradeActionEnum.Wait, confidence: SCANNER.waitConfidence, reasons: patterns.map((p) => p.id) };
    }

    const averageConfidence = selectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / selectedPatterns.length;
    const confluenceBonus = Math.min(
      SCANNER.maxConfluenceBonus,
      Math.max(0, selectedPatterns.length - 1) * SCANNER.confluenceBonusStep,
    );
    const confidence = Math.min(SCANNER.maxConfidence, Math.round(averageConfidence + confluenceBonus));
    const action = direction === PatternDirectionEnum.Bullish ? TradeActionEnum.Buy : TradeActionEnum.Sell;

    return {
      action,
      confidence,
      entry: strongestPattern.entry,
      stop: strongestPattern.stop,
      targets: strongestPattern.targets,
      reasons: selectedPatterns.map((p) => p.id),
    };
  }
}

const defaultScanner = new Scanner([
  new HammerDetector(),
  new ShootingStarDetector(),
  new DojiDetector(),
  new BullishEngulfingDetector(),
  new BearishEngulfingDetector(),
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
