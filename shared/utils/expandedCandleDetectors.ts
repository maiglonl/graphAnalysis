import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BearishKickerDetector } from '#shared/utils/detectors/candle/bearishKicker';
import { BearishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bearishSeparatingLines';
import { BullishKickerDetector } from '#shared/utils/detectors/candle/bullishKicker';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { BullishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bullishSeparatingLines';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { FallingThreeMethodsDetector } from '#shared/utils/detectors/candle/fallingThreeMethods';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { RisingThreeMethodsDetector } from '#shared/utils/detectors/candle/risingThreeMethods';
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
    new RisingThreeMethodsDetector(),
    new FallingThreeMethodsDetector(),
    new BullishSeparatingLinesDetector(),
    new BearishSeparatingLinesDetector(),
  ];
}
