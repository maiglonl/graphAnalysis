import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { DoubleBottomDetector } from '#shared/utils/detectors/priceAction/doubleBottom';
import { DoubleTopDetector } from '#shared/utils/detectors/priceAction/doubleTop';
import { HeadAndShouldersDetector } from '#shared/utils/detectors/priceAction/headAndShoulders';
import { InverseHeadAndShouldersDetector } from '#shared/utils/detectors/priceAction/inverseHeadAndShoulders';
import { TripleBottomDetector } from '#shared/utils/detectors/priceAction/tripleBottom';
import { TripleTopDetector } from '#shared/utils/detectors/priceAction/tripleTop';
import { BullishFlagDetector } from '#shared/utils/detectors/priceAction/bullishFlag';
import { BearishFlagDetector } from '#shared/utils/detectors/priceAction/bearishFlag';
import { BullishPennantDetector } from '#shared/utils/detectors/priceAction/bullishPennant';
import { BearishPennantDetector } from '#shared/utils/detectors/priceAction/bearishPennant';
import { AscendingTriangleDetector } from '#shared/utils/detectors/priceAction/ascendingTriangle';
import { DescendingTriangleDetector } from '#shared/utils/detectors/priceAction/descendingTriangle';
import { SymmetricalTriangleDetector } from '#shared/utils/detectors/priceAction/symmetricalTriangle';
import { RisingWedgeDetector } from '#shared/utils/detectors/priceAction/risingWedge';
import { FallingWedgeDetector } from '#shared/utils/detectors/priceAction/fallingWedge';
import { RectangleBreakoutUpDetector } from '#shared/utils/detectors/priceAction/rectangleBreakoutUp';
import { RectangleBreakoutDownDetector } from '#shared/utils/detectors/priceAction/rectangleBreakoutDown';
import { RangeRejectionHighDetector } from '#shared/utils/detectors/priceAction/rangeRejectionHigh';
import { RangeRejectionLowDetector } from '#shared/utils/detectors/priceAction/rangeRejectionLow';
import { ChannelBreakoutDetector } from '#shared/utils/detectors/priceAction/channelBreakout';

export function createExpandedPriceActionDetectors(): PatternDetector[] {
  return [
    new DoubleTopDetector(),
    new DoubleBottomDetector(),
    new TripleTopDetector(),
    new TripleBottomDetector(),
    new HeadAndShouldersDetector(),
    new InverseHeadAndShouldersDetector(),
    new BullishFlagDetector(),
    new BearishFlagDetector(),
    new BullishPennantDetector(),
    new BearishPennantDetector(),
    new AscendingTriangleDetector(),
    new DescendingTriangleDetector(),
    new SymmetricalTriangleDetector(),
    new RisingWedgeDetector(),
    new FallingWedgeDetector(),
    new RectangleBreakoutUpDetector(),
    new RectangleBreakoutDownDetector(),
    new RangeRejectionHighDetector(),
    new RangeRejectionLowDetector(),
    new ChannelBreakoutDetector(),
  ];
}
