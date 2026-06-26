import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';

export abstract class PatternDetector {
  abstract detect(ctx: ScanContext): PatternSignal[];
}
