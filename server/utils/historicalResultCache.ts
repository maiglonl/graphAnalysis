import { IntervalEnum } from '#shared/types/market';
import { HISTORICAL_SIMULATION } from '#shared/utils/detectors/constants';

export type HistoricalResultCacheKind =
  | 'historicalSimulation'
  | 'historicalScoreCalibration'
  | 'historicalCalibratedSimulation'
  | 'historicalWalkForward'
  | 'historicalWalkForwardMulti';

export type HistoricalResultCacheKey = `${HistoricalResultCacheKind}:${string}:${IntervalEnum}:${number}:${number}`;

type HistoricalResultCacheEntry<T> = {
  value: T;
  expiresAt: number;
  createdAt: number;
};

export type HistoricalResultCacheStatusEntry = {
  key: HistoricalResultCacheKey;
  kind: HistoricalResultCacheKind;
  symbol: string;
  interval: IntervalEnum;
  limit: number;
  variant: number;
  ageMs: number;
  ttlRemainingMs: number;
};

export type HistoricalResultCacheStatus = {
  size: number;
  maxEntries: number;
  ttlMs: number;
  entries: HistoricalResultCacheStatusEntry[];
  entriesByKind: Partial<Record<HistoricalResultCacheKind, number>>;
};

const cache = new Map<HistoricalResultCacheKey, HistoricalResultCacheEntry<unknown>>();

export function createHistoricalResultCacheKey(
  kind: HistoricalResultCacheKind,
  symbol: string,
  interval: IntervalEnum,
  limit: number,
  variant = 0,
): HistoricalResultCacheKey {
  return `${kind}:${symbol}:${interval}:${limit}:${variant}`;
}

export function getCachedHistoricalResult<T>(key: HistoricalResultCacheKey): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCachedHistoricalResult<T>(key: HistoricalResultCacheKey, value: T): void {
  const now = Date.now();
  cache.set(key, {
    value,
    createdAt: now,
    expiresAt: now + HISTORICAL_SIMULATION.resultCacheTtlMs,
  });
  pruneHistoricalResultCache();
}

export function clearHistoricalResultCache(): void {
  cache.clear();
}

export async function getOrSetHistoricalEndpointCache<T>(
  key: HistoricalResultCacheKey,
  refresh: boolean,
  factory: () => Promise<T> | T,
): Promise<T> {
  if (!refresh) {
    const cached = getCachedHistoricalResult<T>(key);
    if (cached !== null) return cached;
  }
  const result = await factory();
  setCachedHistoricalResult(key, result);
  return result;
}

export function getHistoricalResultCacheStatus(): HistoricalResultCacheStatus {
  const now = Date.now();
  const entries = [...cache.entries()]
    .map(([key, entry]) => buildStatusEntry(key, entry, now))
    .filter((entry) => entry.ttlRemainingMs > 0)
    .sort((a, b) => a.ttlRemainingMs - b.ttlRemainingMs);

  return {
    size: entries.length,
    maxEntries: HISTORICAL_SIMULATION.resultCacheMaxEntries,
    ttlMs: HISTORICAL_SIMULATION.resultCacheTtlMs,
    entries,
    entriesByKind: entries.reduce<Partial<Record<HistoricalResultCacheKind, number>>>((acc, entry) => {
      acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

function buildStatusEntry(
  key: HistoricalResultCacheKey,
  entry: HistoricalResultCacheEntry<unknown>,
  now: number,
): HistoricalResultCacheStatusEntry {
  const [kind, symbol, interval, limit, variant] = key.split(':');
  return {
    key,
    kind: kind as HistoricalResultCacheKind,
    symbol,
    interval: interval as IntervalEnum,
    limit: Number(limit),
    variant: Number(variant),
    ageMs: now - entry.createdAt,
    ttlRemainingMs: Math.max(0, entry.expiresAt - now),
  };
}

function pruneHistoricalResultCache(): void {
  if (cache.size <= HISTORICAL_SIMULATION.resultCacheMaxEntries) return;

  const orderedEntries = [...cache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  const entriesToDelete = orderedEntries.slice(0, cache.size - HISTORICAL_SIMULATION.resultCacheMaxEntries);
  entriesToDelete.forEach(([key]) => cache.delete(key));
}
