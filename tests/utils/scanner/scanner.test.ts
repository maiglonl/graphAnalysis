import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle, type PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { Scanner } from '#shared/utils/scanner';
import { PatternDetector } from '#shared/utils/detectors/PatternDetector';

class FakeDetector extends PatternDetector {
  constructor(private readonly signals: PatternSignal[]) {
    super();
  }

  detect(_ctx: ScanContext): PatternSignal[] {
    return this.signals;
  }
}

function makeCandles(length = 60): Candle[] {
  return Array.from({ length }, (_, index) => ({
    time: index + 1,
    open: 100,
    high: 105,
    low: 95,
    close: 100,
    volume: 1000,
  }));
}

function signal(id: PatternIdEnum, direction: PatternDirectionEnum): PatternSignal {
  return {
    id,
    direction,
    confidence: 70,
  };
}

describe('Scanner', () => {
  it('returns empty result with insufficient candles', () => {
    const scanner = new Scanner([
      new FakeDetector([signal(PatternIdEnum.Hammer, PatternDirectionEnum.Bullish)]),
    ]);

    expect(scanner.scan(makeCandles(10))).toEqual([]);
  });

  it('returns empty result with invalid candles', () => {
    const scanner = new Scanner([
      new FakeDetector([signal(PatternIdEnum.Hammer, PatternDirectionEnum.Bullish)]),
    ]);
    const candles = makeCandles();
    candles[0] = { ...candles[0]!, high: 90, low: 100 };

    expect(scanner.scan(candles)).toEqual([]);
  });

  it('keeps detector signals with valid candles', () => {
    const expected = signal(PatternIdEnum.Hammer, PatternDirectionEnum.Bullish);
    const scanner = new Scanner([new FakeDetector([expected])]);

    expect(scanner.scan(makeCandles())).toEqual([expected]);
  });

  it('combines signals from multiple detectors', () => {
    const scanner = new Scanner([
      new FakeDetector([signal(PatternIdEnum.Hammer, PatternDirectionEnum.Bullish)]),
      new FakeDetector([signal(PatternIdEnum.BullishFvg, PatternDirectionEnum.Bullish)]),
    ]);

    // BullishFvg (Structure, Actionable, rank=1470) sorts before Hammer (Candle, Actionable, rank=210)
    expect(scanner.scan(makeCandles()).map((item) => item.id)).toEqual([
      PatternIdEnum.BullishFvg,
      PatternIdEnum.Hammer,
    ]);
  });

  it('deduplicates bullish BOS when bullish CHOCH is present', () => {
    const scanner = new Scanner([
      new FakeDetector([
        signal(PatternIdEnum.BullishBos, PatternDirectionEnum.Bullish),
        signal(PatternIdEnum.BullishChoch, PatternDirectionEnum.Bullish),
      ]),
    ]);

    expect(scanner.scan(makeCandles()).map((item) => item.id)).toEqual([PatternIdEnum.BullishChoch]);
  });

  it('deduplicates bearish BOS when bearish CHOCH is present', () => {
    const scanner = new Scanner([
      new FakeDetector([
        signal(PatternIdEnum.BearishBos, PatternDirectionEnum.Bearish),
        signal(PatternIdEnum.BearishChoch, PatternDirectionEnum.Bearish),
      ]),
    ]);

    expect(scanner.scan(makeCandles()).map((item) => item.id)).toEqual([PatternIdEnum.BearishChoch]);
  });
});
