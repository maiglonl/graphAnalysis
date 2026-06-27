import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { normalizeTimeframeSummaryQuery } from '../../server/utils/timeframeSummaryQuery';

describe('normalizeTimeframeSummaryQuery', () => {
  it('uses default symbol and default intervals for empty query', () => {
    expect(normalizeTimeframeSummaryQuery({})).toEqual({
      symbol: 'BTCUSDT',
      intervals: [
        IntervalEnum.FifteenMinutes,
        IntervalEnum.OneHour,
        IntervalEnum.FourHours,
        IntervalEnum.OneDay,
      ],
    });
  });

  it('normalizes symbol and filters invalid intervals', () => {
    expect(normalizeTimeframeSummaryQuery({
      symbol: ' eth-usdt ',
      intervals: '1m,2h,1h,4h',
    })).toEqual({
      symbol: 'ETHUSDT',
      intervals: [IntervalEnum.OneMinute, IntervalEnum.OneHour, IntervalEnum.FourHours],
    });
  });

  it('limits intervals per request', () => {
    expect(normalizeTimeframeSummaryQuery({ intervals: '1m,5m,15m,30m,1h,4h' }).intervals).toEqual([
      IntervalEnum.OneMinute,
      IntervalEnum.FiveMinutes,
      IntervalEnum.FifteenMinutes,
      IntervalEnum.ThirtyMinutes,
    ]);
  });
});
