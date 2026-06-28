import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { MacdBearishCrossDetector } from '#shared/utils/detectors/momentum/macdBearishCross';
import { MacdBearishDivergenceDetector } from '#shared/utils/detectors/momentum/macdBearishDivergence';
import { MacdBullishCrossDetector } from '#shared/utils/detectors/momentum/macdBullishCross';
import { MacdBullishDivergenceDetector } from '#shared/utils/detectors/momentum/macdBullishDivergence';
import { MomentumBreakoutDetector } from '#shared/utils/detectors/momentum/momentumBreakout';
import { MomentumExhaustionDetector } from '#shared/utils/detectors/momentum/momentumExhaustion';
import { RsiBearishDivergenceDetector } from '#shared/utils/detectors/momentum/rsiBearishDivergence';
import { RsiBullishDivergenceDetector } from '#shared/utils/detectors/momentum/rsiBullishDivergence';
import { StochasticOverboughtReversalDetector } from '#shared/utils/detectors/momentum/stochasticOverboughtReversal';
import { StochasticOversoldReversalDetector } from '#shared/utils/detectors/momentum/stochasticOversoldReversal';

export function createExpandedMomentumDetectors(): PatternDetector[] {
  return [
    new RsiBullishDivergenceDetector(),
    new RsiBearishDivergenceDetector(),
    new MacdBullishCrossDetector(),
    new MacdBearishCrossDetector(),
    new MacdBullishDivergenceDetector(),
    new MacdBearishDivergenceDetector(),
    new StochasticOversoldReversalDetector(),
    new StochasticOverboughtReversalDetector(),
    new MomentumBreakoutDetector(),
    new MomentumExhaustionDetector(),
  ];
}
