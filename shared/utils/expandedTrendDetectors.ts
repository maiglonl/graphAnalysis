import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { DeathCrossDetector } from '#shared/utils/detectors/trend/deathCross';
import { EmaBearishStackDetector } from '#shared/utils/detectors/trend/emaBearishStack';
import { EmaBullishStackDetector } from '#shared/utils/detectors/trend/emaBullishStack';
import { GoldenCrossDetector } from '#shared/utils/detectors/trend/goldenCross';
import { MaPullbackBearishDetector } from '#shared/utils/detectors/trend/maPullbackBearish';
import { MaPullbackBullishDetector } from '#shared/utils/detectors/trend/maPullbackBullish';
import { RetestResistanceDetector } from '#shared/utils/detectors/trend/retestResistance';
import { RetestSupportDetector } from '#shared/utils/detectors/trend/retestSupport';
import { TrendlineBreakDownDetector } from '#shared/utils/detectors/trend/trendlineBreakDown';
import { TrendlineBreakUpDetector } from '#shared/utils/detectors/trend/trendlineBreakUp';

export function createExpandedTrendDetectors(): PatternDetector[] {
  return [
    new GoldenCrossDetector(),
    new DeathCrossDetector(),
    new EmaBullishStackDetector(),
    new EmaBearishStackDetector(),
    new MaPullbackBullishDetector(),
    new MaPullbackBearishDetector(),
    new TrendlineBreakUpDetector(),
    new TrendlineBreakDownDetector(),
    new RetestSupportDetector(),
    new RetestResistanceDetector(),
  ];
}
