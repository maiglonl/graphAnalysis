import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { normalizeScanQuery } from '../../server/utils/scanQuery';

describe('normalizeScanQuery', () => {
  it('uses default interval and default symbol for empty query', () => {
    expect(normalizeScanQuery({})).toEqual({
      interval: IntervalEnum.OneHour,
      symbols: ['BTCUSDT'],
    });
  });

  it('normalizes symbols list and interval', () => {
    expect(normalizeScanQuery({ symbols: 'btc-usdt, eth/usdt, !!!', interval: '4h' })).toEqual({
      interval: IntervalEnum.FourHours,
      symbols: ['BTCUSDT', 'ETHUSDT'],
    });
  });

  it('falls back to default interval for invalid intervals', () => {
    expect(normalizeScanQuery({ interval: '2h' })).toMatchObject({
      interval: IntervalEnum.OneHour,
    });
  });

  it('limits symbols per scan', () => {
    const symbols = Array.from({ length: 12 }, (_, index) => `ASSET${index}`).join(',');

    expect(normalizeScanQuery({ symbols }).symbols).toHaveLength(10);
  });
});
