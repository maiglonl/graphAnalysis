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
  ];
}
