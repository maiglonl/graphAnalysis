import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { BreakerBlockBearishDetector } from '#shared/utils/detectors/liquidity/breakerBlockBearish';
import { BreakerBlockBullishDetector } from '#shared/utils/detectors/liquidity/breakerBlockBullish';
import { EqualHighsDetector } from '#shared/utils/detectors/liquidity/equalHighs';
import { EqualLowsDetector } from '#shared/utils/detectors/liquidity/equalLows';
import { LiquiditySweepHighDetector } from '#shared/utils/detectors/liquidity/liquiditySweepHigh';
import { LiquiditySweepLowDetector } from '#shared/utils/detectors/liquidity/liquiditySweepLow';
import { OrderBlockBearishDetector } from '#shared/utils/detectors/liquidity/orderBlockBearish';
import { OrderBlockBullishDetector } from '#shared/utils/detectors/liquidity/orderBlockBullish';
import { StopHuntHighDetector } from '#shared/utils/detectors/liquidity/stopHuntHigh';
import { StopHuntLowDetector } from '#shared/utils/detectors/liquidity/stopHuntLow';

export function createExpandedLiquidityDetectors(): PatternDetector[] {
  return [
    new LiquiditySweepHighDetector(),
    new LiquiditySweepLowDetector(),
    new StopHuntHighDetector(),
    new StopHuntLowDetector(),
    new EqualHighsDetector(),
    new EqualLowsDetector(),
    new OrderBlockBullishDetector(),
    new OrderBlockBearishDetector(),
    new BreakerBlockBullishDetector(),
    new BreakerBlockBearishDetector(),
  ];
}
