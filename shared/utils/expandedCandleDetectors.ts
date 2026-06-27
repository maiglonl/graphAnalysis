import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { SpinningTopDetector } from '#shared/utils/detectors/candle/spinningTop';

export function createExpandedCandleDetectors(): PatternDetector[] {
  return [
    new LongLeggedDojiDetector(),
    new DragonflyDojiDetector(),
    new GravestoneDojiDetector(),
    new SpinningTopDetector(),
    new BullishMarubozuDetector(),
    new RedMarubozuDetector(),
  ];
}
