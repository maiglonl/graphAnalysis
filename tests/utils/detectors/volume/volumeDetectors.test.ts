import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { ClimaxVolumeBottomDetector } from '#shared/utils/detectors/volume/climaxVolumeBottom';
import { ClimaxVolumeTopDetector } from '#shared/utils/detectors/volume/climaxVolumeTop';
import { LowVolumePullbackBearishDetector } from '#shared/utils/detectors/volume/lowVolumePullbackBearish';
import { LowVolumePullbackBullishDetector } from '#shared/utils/detectors/volume/lowVolumePullbackBullish';
import { VolumeSpikeBearishDetector } from '#shared/utils/detectors/volume/volumeSpikeBearish';
import { VolumeSpikeBullishDetector } from '#shared/utils/detectors/volume/volumeSpikeBullish';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('volume detectors', () => {
  it('detects bullish and bearish volume spikes', () => {
    const bullishSignals = new VolumeSpikeBullishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 108, low: 99, close: 107, volume: 5000 },
    )));
    const bearishSignals = new VolumeSpikeBearishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 101, low: 92, close: 93, volume: 5000 },
    )));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.VolumeSpikeBullish, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.VolumeSpikeBearish, direction: PatternDirectionEnum.Bearish });
  });

  it('detects climax volume reversals', () => {
    const topSignals = new ClimaxVolumeTopDetector().detect(new ScanContext(withLastCandle(
      bullishTrendCandles(59),
      { time: 60, open: 160, high: 162, low: 150, close: 151, volume: 7000 },
    )));
    const bottomSignals = new ClimaxVolumeBottomDetector().detect(new ScanContext(withLastCandle(
      bearishTrendCandles(59),
      { time: 60, open: 140, high: 151, low: 138, close: 150, volume: 7000 },
    )));

    expect(topSignals[0]).toMatchObject({ id: PatternIdEnum.ClimaxVolumeTop, direction: PatternDirectionEnum.Bearish });
    expect(bottomSignals[0]).toMatchObject({ id: PatternIdEnum.ClimaxVolumeBottom, direction: PatternDirectionEnum.Bullish });
  });

  it('detects low volume pullbacks', () => {
    const bullishSignals = new LowVolumePullbackBullishDetector().detect(new ScanContext(withLastCandle(
      bullishTrendCandles(59),
      { time: 60, open: 159, high: 160, low: 155, close: 156, volume: 200 },
    )));
    const bearishSignals = new LowVolumePullbackBearishDetector().detect(new ScanContext(withLastCandle(
      bearishTrendCandles(59),
      { time: 60, open: 141, high: 145, low: 140, close: 144, volume: 200 },
    )));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.LowVolumePullbackBullish, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.LowVolumePullbackBearish, direction: PatternDirectionEnum.Bearish });
  });
});
