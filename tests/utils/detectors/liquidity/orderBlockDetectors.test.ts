import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { OrderBlockBullishDetector } from '#shared/utils/detectors/liquidity/orderBlockBullish';
import { OrderBlockBearishDetector } from '#shared/utils/detectors/liquidity/orderBlockBearish';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles } from '../../../fixtures/candles/factories';

// Bullish order block: 9 flat candles at 90 (range high=95), then:
//   bearish previous (open=90, close=87), then bullish impulse (close=98).
// ctx.index=10; reference = slice(0,9) → rangeHigh=95; 98>95 and impulse ≈ 12.6%.

function bullishOrderBlockCandles() {
  const base = [
    ...flatCandles(9, 90),
    { time: 10, open: 90, high: 91, low: 85, close: 87, volume: 1000 },
  ];
  return [...base, { time: 11, open: 87, high: 99, low: 86, close: 98, volume: 1000 }];
}

// Bearish order block: 9 flat candles at 100 (range low=95), then:
//   bullish previous (open=100, close=105), then bearish impulse (close=92).
// 92<95 and impulse ≈ 12.4%.

function bearishOrderBlockCandles() {
  const base = [
    ...flatCandles(9, 100),
    { time: 10, open: 100, high: 106, low: 99, close: 105, volume: 1000 },
  ];
  return [...base, { time: 11, open: 105, high: 106, low: 91, close: 92, volume: 1000 }];
}

describe('order block bullish detector', () => {
  it('detects bullish order block after bearish candle followed by impulse', () => {
    const signals = new OrderBlockBullishDetector().detect(new ScanContext(bullishOrderBlockCandles()));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.OrderBlockBullish,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire when impulse does not exceed range high', () => {
    const base = [
      ...flatCandles(9, 90),
      { time: 10, open: 90, high: 91, low: 85, close: 87, volume: 1000 },
    ];
    const candles = [...base, { time: 11, open: 87, high: 94, low: 86, close: 93, volume: 1000 }];
    const signals = new OrderBlockBullishDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when previous candle is bullish', () => {
    const base = [
      ...flatCandles(9, 90),
      { time: 10, open: 86, high: 91, low: 85, close: 90, volume: 1000 },
    ];
    const candles = [...base, { time: 11, open: 90, high: 99, low: 89, close: 98, volume: 1000 }];
    const signals = new OrderBlockBullishDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with fewer candles than lookback', () => {
    const signals = new OrderBlockBullishDetector().detect(new ScanContext(flatCandles(5)));
    expect(signals).toHaveLength(0);
  });
});

describe('order block bearish detector', () => {
  it('detects bearish order block after bullish candle followed by impulse', () => {
    const signals = new OrderBlockBearishDetector().detect(new ScanContext(bearishOrderBlockCandles()));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.OrderBlockBearish,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire when impulse does not break range low', () => {
    const base = [
      ...flatCandles(9, 100),
      { time: 10, open: 100, high: 106, low: 99, close: 105, volume: 1000 },
    ];
    const candles = [...base, { time: 11, open: 105, high: 106, low: 97, close: 97, volume: 1000 }];
    const signals = new OrderBlockBearishDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when previous candle is bearish', () => {
    const base = [
      ...flatCandles(9, 100),
      { time: 10, open: 104, high: 106, low: 99, close: 100, volume: 1000 },
    ];
    const candles = [...base, { time: 11, open: 100, high: 101, low: 91, close: 92, volume: 1000 }];
    const signals = new OrderBlockBearishDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with fewer candles than lookback', () => {
    const signals = new OrderBlockBearishDetector().detect(new ScanContext(flatCandles(5)));
    expect(signals).toHaveLength(0);
  });
});
