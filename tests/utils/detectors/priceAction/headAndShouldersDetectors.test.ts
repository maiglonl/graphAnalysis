import { describe, expect, it, vi } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, SwingPointTypeEnum } from '#shared/types/market';
import { HeadAndShouldersDetector } from '#shared/utils/detectors/priceAction/headAndShoulders';
import { InverseHeadAndShouldersDetector } from '#shared/utils/detectors/priceAction/inverseHeadAndShoulders';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

const marketStructureMocks = vi.hoisted(() => ({
  getSwingHighs: vi.fn(),
  getSwingLows: vi.fn(),
}));

vi.mock('#shared/utils/marketStructure', () => marketStructureMocks);

describe('head and shoulders price action detectors', () => {
  it('detects head and shoulders after neckline break', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 56, price: 109, type: SwingPointTypeEnum.High },
      { index: 49, price: 116, type: SwingPointTypeEnum.High },
      { index: 42, price: 110, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 53, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 101, high: 102, low: 97, close: 99, volume: 1000 },
    );

    const signals = new HeadAndShouldersDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.HeadAndShoulders,
      direction: PatternDirectionEnum.Bearish,
      entry: 99,
    });
  });

  it('detects inverse head and shoulders after neckline break', () => {
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 56, price: 91, type: SwingPointTypeEnum.Low },
      { index: 49, price: 84, type: SwingPointTypeEnum.Low },
      { index: 42, price: 90, type: SwingPointTypeEnum.Low },
    ]);
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 53, price: 100, type: SwingPointTypeEnum.High },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 99, high: 103, low: 98, close: 101, volume: 1000 },
    );

    const signals = new InverseHeadAndShouldersDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.InverseHeadAndShoulders,
      direction: PatternDirectionEnum.Bullish,
      entry: 101,
    });
  });

  it('ignores head and shoulders without neckline break', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 56, price: 109, type: SwingPointTypeEnum.High },
      { index: 49, price: 116, type: SwingPointTypeEnum.High },
      { index: 42, price: 110, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 53, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 103, high: 104, low: 100, close: 100.1, volume: 1000 },
    );

    const signals = new HeadAndShouldersDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });

  it('ignores head and shoulders when head is not prominent above shoulders', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 55, price: 110, type: SwingPointTypeEnum.High },
      { index: 48, price: 111, type: SwingPointTypeEnum.High },
      { index: 41, price: 110, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 46, price: 100, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 101, low: 98, close: 99, volume: 1000 },
    );

    const signals = new HeadAndShouldersDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });

  it('ignores head and shoulders when shoulders are too asymmetric', () => {
    marketStructureMocks.getSwingHighs.mockReturnValue([
      { index: 55, price: 108, type: SwingPointTypeEnum.High },
      { index: 48, price: 120, type: SwingPointTypeEnum.High },
      { index: 41, price: 100, type: SwingPointTypeEnum.High },
    ]);
    marketStructureMocks.getSwingLows.mockReturnValue([
      { index: 46, price: 90, type: SwingPointTypeEnum.Low },
    ]);

    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 90, high: 91, low: 88, close: 89, volume: 1000 },
    );

    const signals = new HeadAndShouldersDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });
});
