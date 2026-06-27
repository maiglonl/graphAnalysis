import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BearishKickerDetector } from '#shared/utils/detectors/candle/bearishKicker';
import { BullishKickerDetector } from '#shared/utils/detectors/candle/bullishKicker';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { SpinningTopDetector } from '#shared/utils/detectors/candle/spinningTop';
import { ThreeBlackCrowsDetector } from '#shared/utils/detectors/candle/threeBlackCrows';
import { ThreeWhiteSoldiersDetector } from '#shared/utils/detectors/candle/threeWhiteSoldiers';

export function createExpandedCandleDetectors(): PatternDetector[] {
  return [
    new LongLeggedDojiDetector(),
    new DragonflyDojiDetector(),
    new GravestoneDojiDetector(),
    new SpinningTopDetector(),
    new BullishMarubozuDetector(),
    new RedMarubozuDetector(),
    new BullishKickerDetector(),
    new BearishKickerDetector(),
    new ThreeWhiteSoldiersDetector(),
    new ThreeBlackCrowsDetector(),
  ];
}
