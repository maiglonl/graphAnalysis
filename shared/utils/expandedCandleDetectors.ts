import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BearishBreakawayGapDetector } from '#shared/utils/detectors/candle/bearishBreakawayGap';
import { BearishKickerDetector } from '#shared/utils/detectors/candle/bearishKicker';
import { BearishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bearishSeparatingLines';
import { BullishBreakawayGapDetector } from '#shared/utils/detectors/candle/bullishBreakawayGap';
import { BullishKickerDetector } from '#shared/utils/detectors/candle/bullishKicker';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { BullishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bullishSeparatingLines';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { FallingThreeMethodsDetector } from '#shared/utils/detectors/candle/fallingThreeMethods';
import { GapFillBearishDetector } from '#shared/utils/detectors/candle/gapFillBearish';
import { GapFillBullishDetector } from '#shared/utils/detectors/candle/gapFillBullish';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { RisingThreeMethodsDetector } from '#shared/utils/detectors/candle/risingThreeMethods';
import { RunawayGapDownDetector } from '#shared/utils/detectors/candle/runawayGapDown';
import { RunawayGapUpDetector } from '#shared/utils/detectors/candle/runawayGapUp';
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
    new BullishBreakawayGapDetector(),
    new BearishBreakawayGapDetector(),
    new RunawayGapUpDetector(),
    new RunawayGapDownDetector(),
    new GapFillBullishDetector(),
    new GapFillBearishDetector(),
  ];
}
