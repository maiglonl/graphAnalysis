import type { Candle } from '#shared/types/market';

export function flatCandles(count: number, price = 100): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    time: index + 1,
    open: price,
    high: price + 5,
    low: price - 5,
    close: price,
    volume: 1000,
  }));
}

export function narrowFlatCandles(count: number, price = 100): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    time: index + 1,
    open: price,
    high: price + 1,
    low: price - 1,
    close: price,
    volume: 1000,
  }));
}

export function bullishTrendCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 100 + index;

    return {
      time: index + 1,
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000,
    };
  });
}

export function bearishTrendCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 200 - index;

    return {
      time: index + 1,
      open: close + 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000,
    };
  });
}

export function withLastCandle(base: Candle[], last: Candle): Candle[] {
  return [...base, last];
}
