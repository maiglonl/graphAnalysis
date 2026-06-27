import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BearishBreakawayGapDetector } from '#shared/utils/detectors/candle/bearishBreakawayGap';
import { BearishKickerDetector } from '#shared/utils/detectors/candle/bearishKicker';
import { BearishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bearishSeparatingLines';
import { BullishBreakawayGapDetector } from '#shared/utils/detectors/candle/bullishBreakawayGap';
import { BullishKickerDetector } from '#shared/utils/detectors/candle/bullishKicker';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { BullishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bullishSeparatingLines';
import { CloseToPriorCloseDownContinuationDetector } from '#shared/utils/detectors/candle/closeToPriorCloseDownContinuation';
import { DeepCloseDownContinuationDetector } from '#shared/utils/detectors/candle/deepCloseDownContinuation';
import { DownsideTasukiGapDetector } from '#shared/utils/detectors/candle/downsideTasukiGap';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { ExhaustionGapDownDetector } from '#shared/utils/detectors/candle/exhaustionGapDown';
import { ExhaustionGapUpDetector } from '#shared/utils/detectors/candle/exhaustionGapUp';
import { FallingThreeMethodsDetector } from '#shared/utils/detectors/candle/fallingThreeMethods';
import { GapFillBearishDetector } from '#shared/utils/detectors/candle/gapFillBearish';
import { GapFillBullishDetector } from '#shared/utils/detectors/candle/gapFillBullish';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { IslandReversalBottomDetector } from '#shared/utils/detectors/candle/islandReversalBottom';
import { IslandReversalTopDetector } from '#shared/utils/detectors/candle/islandReversalTop';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { MatHoldDetector } from '#shared/utils/detectors/candle/matHold';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { RisingThreeMethodsDetector } from '#shared/utils/detectors/candle/risingThreeMethods';
import { RunawayGapDownDetector } from '#shared/utils/detectors/candle/runawayGapDown';
import { RunawayGapUpDetector } from '#shared/utils/detectors/candle/runawayGapUp';
import { SlightCloseDownContinuationDetector } from '#shared/utils/detectors/candle/slightCloseDownContinuation';
import { SpinningTopDetector } from '#shared/utils/detectors/candle/spinningTop';
import { ThreeBlackCrowsDetector } from '#shared/utils/detectors/candle/threeBlackCrows';
import { ThreeWhiteSoldiersDetector } from '#shared/utils/detectors/candle/threeWhiteSoldiers';
import { UpsideTasukiGapDetector } from '#shared/utils/detectors/candle/upsideTasukiGap';

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
    new MatHoldDetector(),
    new BullishSeparatingLinesDetector(),
    new BearishSeparatingLinesDetector(),
    new UpsideTasukiGapDetector(),
    new DownsideTasukiGapDetector(),
    new CloseToPriorCloseDownContinuationDetector(),
    new SlightCloseDownContinuationDetector(),
    new DeepCloseDownContinuationDetector(),
    new BullishBreakawayGapDetector(),
    new BearishBreakawayGapDetector(),
    new RunawayGapUpDetector(),
    new RunawayGapDownDetector(),
    new ExhaustionGapUpDetector(),
    new ExhaustionGapDownDetector(),
    new GapFillBullishDetector(),
    new GapFillBearishDetector(),
    new IslandReversalBottomDetector(),
    new IslandReversalTopDetector(),
  ];
}
