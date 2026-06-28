import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { AtrCompressionDetector } from '#shared/utils/detectors/volatility/atrCompression';
import { AtrExpansionBreakoutDetector } from '#shared/utils/detectors/volatility/atrExpansionBreakout';
import { CompressionSqueezeDetector } from '#shared/utils/detectors/volatility/compressionSqueeze';
import { WideRangeCandleDetector } from '#shared/utils/detectors/volatility/wideRangeCandle';
import { ClimaxVolumeBottomDetector } from '#shared/utils/detectors/volume/climaxVolumeBottom';
import { ClimaxVolumeTopDetector } from '#shared/utils/detectors/volume/climaxVolumeTop';
import { LowVolumePullbackBearishDetector } from '#shared/utils/detectors/volume/lowVolumePullbackBearish';
import { LowVolumePullbackBullishDetector } from '#shared/utils/detectors/volume/lowVolumePullbackBullish';
import { VolumeSpikeBearishDetector } from '#shared/utils/detectors/volume/volumeSpikeBearish';
import { VolumeSpikeBullishDetector } from '#shared/utils/detectors/volume/volumeSpikeBullish';

export function createExpandedVolumeVolatilityDetectors(): PatternDetector[] {
  return [
    new VolumeSpikeBullishDetector(),
    new VolumeSpikeBearishDetector(),
    new ClimaxVolumeTopDetector(),
    new ClimaxVolumeBottomDetector(),
    new LowVolumePullbackBullishDetector(),
    new LowVolumePullbackBearishDetector(),
    new AtrExpansionBreakoutDetector(),
    new AtrCompressionDetector(),
    new CompressionSqueezeDetector(),
    new WideRangeCandleDetector(),
  ];
}
