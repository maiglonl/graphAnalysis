import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { RisingWedgeDetector } from '#shared/utils/detectors/priceAction/risingWedge';
import { FallingWedgeDetector } from '#shared/utils/detectors/priceAction/fallingWedge';
import { ChannelBreakoutDetector } from '#shared/utils/detectors/priceAction/channelBreakout';
import { ScanContext } from '#shared/utils/scanContext';
import type { Candle } from '#shared/types/market';

// Rising wedge: both ascending, spread converges 4.0→2.0
// First 6: high 104→106.5 (avg 105.25), low 100→102.5 (avg 101.25)
// Second 6: high 107→108.5 (avg 107.75), low 105→106.5 (avg 105.75)
function risingWedgeLookback(): Candle[] {
  const firstHighs = [104, 104.5, 105, 105.5, 106, 106.5];
  const firstLows = [100, 100.5, 101, 101.5, 102, 102.5];
  const secondHighs = [107, 107.3, 107.6, 107.9, 108.2, 108.5];
  const secondLows = [105, 105.3, 105.6, 105.9, 106.2, 106.5];
  return [
    ...firstHighs.map((high, i) => ({
      time: i + 1, open: (high + firstLows[i]!) / 2,
      high, low: firstLows[i]!, close: (high + firstLows[i]!) / 2, volume: 1000,
    })),
    ...secondHighs.map((high, i) => ({
      time: i + 7, open: (high + secondLows[i]!) / 2,
      high, low: secondLows[i]!, close: (high + secondLows[i]!) / 2, volume: 1000,
    })),
  ];
}

// Falling wedge: both descending, spread converges 4.0→2.5
// First 6: high 109→107 (avg 108), low 105→103 (avg 104)
// Second 6: high 106→104 (avg 105), low 103.5→101.5 (avg 102.5)
function fallingWedgeLookback(): Candle[] {
  const firstHighs = [109, 108.6, 108.2, 107.8, 107.4, 107];
  const firstLows = [105, 104.6, 104.2, 103.8, 103.4, 103];
  const secondHighs = [106, 105.6, 105.2, 104.8, 104.4, 104];
  const secondLows = [103.5, 103.1, 102.7, 102.3, 101.9, 101.5];
  return [
    ...firstHighs.map((high, i) => ({
      time: i + 1, open: (high + firstLows[i]!) / 2,
      high, low: firstLows[i]!, close: (high + firstLows[i]!) / 2, volume: 1000,
    })),
    ...secondHighs.map((high, i) => ({
      time: i + 7, open: (high + secondLows[i]!) / 2,
      high, low: secondLows[i]!, close: (high + secondLows[i]!) / 2, volume: 1000,
    })),
  ];
}

// Upward channel: both highs and lows rising ~1.9% between halves
// First 6: avg high=105, avg low=102 | Second 6: avg high=107, avg low=104
function upwardChannelLookback(): Candle[] {
  const firstHighs = [104, 104.4, 104.8, 105.2, 105.6, 106];
  const firstLows = [101, 101.4, 101.8, 102.2, 102.6, 103];
  const secondHighs = [106, 106.4, 106.8, 107.2, 107.6, 108];
  const secondLows = [103, 103.4, 103.8, 104.2, 104.6, 105];
  return [
    ...firstHighs.map((high, i) => ({
      time: i + 1, open: (high + firstLows[i]!) / 2,
      high, low: firstLows[i]!, close: (high + firstLows[i]!) / 2, volume: 1000,
    })),
    ...secondHighs.map((high, i) => ({
      time: i + 7, open: (high + secondLows[i]!) / 2,
      high, low: secondLows[i]!, close: (high + secondLows[i]!) / 2, volume: 1000,
    })),
  ];
}

// Downward channel: both highs and lows falling ~1.9% between halves
function downwardChannelLookback(): Candle[] {
  const firstHighs = [108, 107.6, 107.2, 106.8, 106.4, 106];
  const firstLows = [105, 104.6, 104.2, 103.8, 103.4, 103];
  const secondHighs = [106, 105.6, 105.2, 104.8, 104.4, 104];
  const secondLows = [103, 102.6, 102.2, 101.8, 101.4, 101];
  return [
    ...firstHighs.map((high, i) => ({
      time: i + 1, open: (high + firstLows[i]!) / 2,
      high, low: firstLows[i]!, close: (high + firstLows[i]!) / 2, volume: 1000,
    })),
    ...secondHighs.map((high, i) => ({
      time: i + 7, open: (high + secondLows[i]!) / 2,
      high, low: secondLows[i]!, close: (high + secondLows[i]!) / 2, volume: 1000,
    })),
  ];
}

describe('RisingWedgeDetector', () => {
  it('detects bearish breakout below rising wedge', () => {
    // rangeHigh=108.5, rangeLow=100 → bearish breakout close < 99.8
    const candles = [
      ...risingWedgeLookback(),
      { time: 13, open: 99.5, high: 100, low: 97, close: 98, volume: 1200 },
    ];
    const signals = new RisingWedgeDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RisingWedge,
      direction: PatternDirectionEnum.Bearish,
    });
    expect(signals[0]?.targets?.length).toBeGreaterThan(0);
  });

  it('ignores when close does not break below wedge', () => {
    const candles = [
      ...risingWedgeLookback(),
      { time: 13, open: 106, high: 107, low: 105, close: 106.5, volume: 1000 },
    ];
    const signals = new RisingWedgeDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('FallingWedgeDetector', () => {
  it('detects bullish breakout above falling wedge', () => {
    // rangeHigh=109, rangeLow=101.5 → bullish breakout close > 109.218
    const candles = [
      ...fallingWedgeLookback(),
      { time: 13, open: 109.5, high: 113, low: 109.2, close: 111, volume: 1200 },
    ];
    const signals = new FallingWedgeDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.FallingWedge,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('ignores when close does not break above wedge', () => {
    const candles = [
      ...fallingWedgeLookback(),
      { time: 13, open: 104, high: 105, low: 103, close: 104, volume: 1000 },
    ];
    const signals = new FallingWedgeDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('ChannelBreakoutDetector', () => {
  it('detects bullish breakout from upward channel', () => {
    // rangeHigh=108, breakout close > 108.216
    const candles = [
      ...upwardChannelLookback(),
      { time: 13, open: 109, high: 113, low: 108.5, close: 111, volume: 1200 },
    ];
    const signals = new ChannelBreakoutDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ChannelBreakout,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects bearish breakout from downward channel', () => {
    // rangeLow=101, breakout close < 100.8
    const candles = [
      ...downwardChannelLookback(),
      { time: 13, open: 100.5, high: 101, low: 97, close: 98, volume: 1200 },
    ];
    const signals = new ChannelBreakoutDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ChannelBreakout,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores when close stays inside channel', () => {
    const candles = [
      ...upwardChannelLookback(),
      { time: 13, open: 105, high: 107, low: 104, close: 106, volume: 1000 },
    ];
    const signals = new ChannelBreakoutDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});
