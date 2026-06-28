import { describe, expect, it, vi } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, SwingPointTypeEnum } from '#shared/types/market';
import { DoubleBottomDetector } from '#shared/utils/detectors/priceAction/doubleBottom';
import { DoubleTopDetector } from '#shared/utils/detectors/priceAction/doubleTop';
import { TripleBottomDetector } from '#shared/utils/detectors/priceAction/tripleBottom';
import { TripleTopDetector } from '#shared/utils/detectors/priceAction/tripleTop';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

const marketStructureMocks = vi.hoisted(() => ({
  getSwingHighs: vi.fn(),
  getSwingLows: vi.fn(),
}));

vi.mock('#shared/utils/marketStructure', () => marketStructureMocks);

describe('swing reversal pattern detectors', () => {
  it('detects double top after neckline break', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 50, price: 110, type: SwingPointTypeEnum.High },
      { index: 42, price: 109.8, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 101, high: 102, low: 98, close: 99, volume: 1000 },
    );

    const signals = new DoubleTopDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.DoubleTop,
      direction: PatternDirectionEnum.Bearish,
      entry: 99,
    });
  });

  it('detects double bottom after neckline break', () => {
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 50, price: 90, type: SwingPointTypeEnum.Low },
      { index: 42, price: 90.2, type: SwingPointTypeEnum.Low },
    ]);
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.High },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 99, high: 102, low: 98, close: 101, volume: 1000 },
    );

    const signals = new DoubleBottomDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.DoubleBottom,
      direction: PatternDirectionEnum.Bullish,
      entry: 101,
    });
  });

  it('detects triple top after neckline break', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 55, price: 110, type: SwingPointTypeEnum.High },
      { index: 48, price: 110.3, type: SwingPointTypeEnum.High },
      { index: 41, price: 109.9, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 101, high: 102, low: 98, close: 99, volume: 1000 },
    );

    const signals = new TripleTopDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TripleTop,
      direction: PatternDirectionEnum.Bearish,
      entry: 99,
    });
  });

  it('detects triple bottom after neckline break', () => {
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 55, price: 90, type: SwingPointTypeEnum.Low },
      { index: 48, price: 89.8, type: SwingPointTypeEnum.Low },
      { index: 41, price: 90.1, type: SwingPointTypeEnum.Low },
    ]);
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.High },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 99, high: 103, low: 98, close: 101, volume: 1000 },
    );

    const signals = new TripleBottomDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TripleBottom,
      direction: PatternDirectionEnum.Bullish,
      entry: 101,
    });
  });

  it('ignores double top when close has not broken neckline', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 50, price: 110, type: SwingPointTypeEnum.High },
      { index: 42, price: 109.8, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 101, high: 105, low: 99, close: 100, volume: 1000 },
    );

    const signals = new DoubleTopDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });
});
