import type { Candle, PatternSignal, TradeSuggestion } from '#shared/types/market';
import { PatternDirectionEnum, TradeActionEnum } from '#shared/types/market';
import { createScanContext } from '#shared/utils/scanContext';
import type { PatternDetector } from '#shared/utils/detectors/base';
import {
  HammerDetector,
  ShootingStarDetector,
  DojiDetector,
  BullishEngulfingDetector,
  BearishEngulfingDetector,
  InsideBarDetector,
  BullishFvgDetector,
  BearishFvgDetector,
} from '#shared/utils/detectors/candleDetectors';
import { MarketStructureDetector, BosDetector, ChochDetector } from '#shared/utils/detectors/structureDetectors';

const DETECTORS: PatternDetector[] = [
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
];

export function scanPatterns(candles: Candle[]): PatternSignal[] {
  if (candles.length < 50) return [];
  const ctx = createScanContext(candles);
  return DETECTORS.flatMap((detector) => detector.detect(ctx));
}

export function buildSuggestion(candles: Candle[], patterns: PatternSignal[]): TradeSuggestion {
  const last = candles.at(-1);

  if (!last || patterns.length === 0) {
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
    return { action: TradeActionEnum.Wait, confidence: 45, reasons: patterns.map((p) => p.id) };
  }

  const selectedPatterns = direction === PatternDirectionEnum.Bullish ? bullish : bearish;
  const best = selectedPatterns.sort((a, b) => b.confidence - a.confidence)[0]!;
  const averageConfidence = selectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / selectedPatterns.length;
  const confluenceBonus = Math.min(15, Math.max(0, selectedPatterns.length - 1) * 5);
  const confidence = Math.min(95, Math.round(averageConfidence + confluenceBonus));
  const action = direction === PatternDirectionEnum.Bullish ? TradeActionEnum.Buy : TradeActionEnum.Sell;

  return {
    action,
    confidence,
    entry: best.entry,
    stop: best.stop,
    targets: best.targets,
    reasons: selectedPatterns.map((p) => p.id),
  };
}
