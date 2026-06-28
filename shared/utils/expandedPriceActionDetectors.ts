import type { PatternDetector } from '#shared/utils/detectors/PatternDetector';
import { DoubleBottomDetector } from '#shared/utils/detectors/priceAction/doubleBottom';
import { DoubleTopDetector } from '#shared/utils/detectors/priceAction/doubleTop';
import { TripleBottomDetector } from '#shared/utils/detectors/priceAction/tripleBottom';

export function createExpandedPriceActionDetectors(): PatternDetector[] {
  return [
    new DoubleTopDetector(),
    new DoubleBottomDetector(),
    new TripleBottomDetector(),
  ];
}
