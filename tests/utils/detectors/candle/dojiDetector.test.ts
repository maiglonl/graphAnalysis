import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle } from '#shared/types/market';
import { DojiDetector } from '#shared/utils/detectors/candle/doji';
import { ScanContext } from '#shared/utils/scanContext';

function candlesWithLast(last: Candle): Candle[] {
  return [
    ...Array.from({ length: 59 }, (_, index) => ({
      time: index + 1,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000,
    })),
    last,
  ];
}

describe('DojiDetector', () => {
  it('detects doji when body is very small relative to range', () => {
    const candles = candlesWithLast({ time: 60, open: 100, high: 110, low: 90, close: 100.5, volume: 1000 });

    const signals = new DojiDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.Doji,
      direction: PatternDirectionEnum.Neutral,
      price: 100.5,
    });
  });

  it('ignores candles with body larger than doji threshold', () => {
    const candles = candlesWithLast({ time: 60, open: 100, high: 110, low: 90, close: 105, volume: 1000 });

    const signals = new DojiDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
