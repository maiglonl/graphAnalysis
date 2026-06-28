import type {
  AnalyzeResponse,
  HistoricalSimulationResult,
  MultiTimeframeResponse,
  ScanListResponse,
} from '#shared/types/market';
import type { PatternScoreCalibration } from '#shared/utils/scoreCalibration';
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, TradeActionEnum } from '#shared/types/market';
import { resolveApiErrorMessage } from '~/utils/apiErrors';
import {
  addSimulationHistorySnapshot,
  buildSimulationHistorySnapshot,
  type SimulationHistorySnapshot,
} from '~/utils/simulationHistory';
import { addWatchlistSymbol, removeWatchlistSymbol } from '~/utils/watchlist';
import { computeRankingSummary } from '~/utils/rankingSummary';
import type { RankingSummary } from '~/utils/rankingSummary';

const ANALYSIS_HISTORY_MAX_ITEMS = 10;

export type OpportunityActionFilter = TradeActionEnum | 'all';

export type HistoricalTimeframeSummaryResponse = {
  symbol: string;
  items: HistoricalSimulationResult[];
};

export type HistoricalScoreCalibrationResult = {
  symbol: string;
  interval: IntervalEnum;
  patternAdjustments: PatternScoreCalibration[];
};

export type AnalysisHistorySnapshot = {
  symbol: string;
  interval: IntervalEnum;
  price: number | null;
  action: TradeActionEnum;
  confidence: number;
  createdAt: number;
};

export function useTechnicalScannerDashboard() {
  const { t } = useI18n();

  const symbol = usePersistedRef('graphAnalysis.symbol', DEFAULT_SYMBOL);
  const interval = usePersistedRef<IntervalEnum>('graphAnalysis.interval', DEFAULT_INTERVAL);
  const intervals = Object.values(IntervalEnum) as IntervalEnum[];
  const symbolsToScan = usePersistedRef('graphAnalysis.symbolsToScan', 'BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT');
  const actionFilter = usePersistedRef<OpportunityActionFilter>('graphAnalysis.actionFilter', 'all');
  const minConfidence = usePersistedRef('graphAnalysis.minConfidence', 0);
  const actionFilters = ['all', ...Object.values(TradeActionEnum)] as OpportunityActionFilter[];
  const analysisHistory = usePersistedJsonRef<AnalysisHistorySnapshot[]>('graphAnalysis.analysisHistory', []);
  const simulationHistory = usePersistedJsonRef<SimulationHistorySnapshot[]>('graphAnalysis.simulationHistory', []);
  const watchlist = usePersistedJsonRef<string[]>('graphAnalysis.watchlist', [DEFAULT_SYMBOL, 'ETHUSDT', 'SOLUSDT']);
  const watchlistSymbol = ref('');

  const result = ref<AnalyzeResponse | null>(null);
  const scanResult = ref<ScanListResponse | null>(null);
  const historicalSimulation = ref<HistoricalSimulationResult | null>(null);
  const historicalTimeframeSummary = ref<HistoricalTimeframeSummaryResponse | null>(null);
  const scoreCalibration = ref<HistoricalScoreCalibrationResult | null>(null);
  const timeframeSummary = ref<MultiTimeframeResponse | null>(null);
  const loading = ref(false);
  const scanLoading = ref(false);
  const simulationLoading = ref(false);
  const historicalTimeframeLoading = ref(false);
  const scoreCalibrationLoading = ref(false);
  const timeframeLoading = ref(false);
  const error = ref('');

  const scanItems = computed(() => scanResult.value?.items ?? []);

  const rankingSummary = computed<RankingSummary>(() => computeRankingSummary(scanItems.value));

  async function analyze() {
    loading.value = true;
    error.value = '';

    try {
      result.value = await $fetch<AnalyzeResponse>('/api/analyze', {
        query: {
          symbol: symbol.value,
          interval: interval.value,
        },
      });
      recordAnalysis(result.value);
      clearDerivedPanels();
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      loading.value = false;
    }
  }

  async function scanSymbols() {
    scanLoading.value = true;
    error.value = '';

    try {
      scanResult.value = await $fetch<ScanListResponse>('/api/scan', {
        query: {
          symbols: symbolsToScan.value,
          interval: interval.value,
        },
      });
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      scanLoading.value = false;
    }
  }

  async function runSimulation() {
    simulationLoading.value = true;
    error.value = '';

    try {
      historicalSimulation.value = await $fetch<HistoricalSimulationResult>('/api/historical-simulation', {
        query: {
          symbol: symbol.value,
          interval: interval.value,
        },
      });
      recordSimulation(historicalSimulation.value);
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      simulationLoading.value = false;
    }
  }

  async function loadHistoricalTimeframeSummary() {
    historicalTimeframeLoading.value = true;
    error.value = '';

    try {
      historicalTimeframeSummary.value = await $fetch<HistoricalTimeframeSummaryResponse>('/api/historical-timeframe-summary', {
        query: {
          symbol: symbol.value,
        },
      });
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      historicalTimeframeLoading.value = false;
    }
  }

  async function loadScoreCalibration() {
    scoreCalibrationLoading.value = true;
    error.value = '';

    try {
      scoreCalibration.value = await $fetch<HistoricalScoreCalibrationResult>('/api/historical-score-calibration', {
        query: {
          symbol: symbol.value,
          interval: interval.value,
        },
      });
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      scoreCalibrationLoading.value = false;
    }
  }

  async function loadTimeframeSummary() {
    timeframeLoading.value = true;
    error.value = '';

    try {
      timeframeSummary.value = await $fetch<MultiTimeframeResponse>('/api/multi-timeframe', {
        query: {
          symbol: symbol.value,
        },
      });
    } catch (err: unknown) {
      error.value = resolveApiErrorMessage(err, t);
    } finally {
      timeframeLoading.value = false;
    }
  }

  function addSymbolToWatchlist() {
    watchlist.value = addWatchlistSymbol(watchlist.value, watchlistSymbol.value);
    watchlistSymbol.value = '';
  }

  function addCurrentSymbolToWatchlist() {
    watchlist.value = addWatchlistSymbol(watchlist.value, symbol.value);
  }

  function removeSymbolFromWatchlist(item: string) {
    watchlist.value = removeWatchlistSymbol(watchlist.value, item);
  }

  async function selectWatchlistSymbol(item: string) {
    symbol.value = item;
    await analyze();
  }

  function selectOpportunity(item: AnalyzeResponse) {
    symbol.value = item.symbol;
    interval.value = item.interval;
    result.value = item;
    recordAnalysis(item);
    clearDerivedPanels();
  }

  function selectTimeframeItem(item: AnalyzeResponse) {
    interval.value = item.interval;
    result.value = item;
    recordAnalysis(item);
    historicalSimulation.value = null;
    scoreCalibration.value = null;
  }

  async function selectHistoryItem(item: AnalysisHistorySnapshot) {
    symbol.value = item.symbol;
    interval.value = item.interval;
    await analyze();
  }

  async function selectSimulationHistoryItem(item: SimulationHistorySnapshot) {
    symbol.value = item.symbol;
    interval.value = item.interval;
    await runSimulation();
  }

  function recordAnalysis(item: AnalyzeResponse) {
    const snapshot = buildAnalysisSnapshot(item);
    const historyWithoutDuplicate = analysisHistory.value.filter(
      (historyItem) => historyItem.symbol !== snapshot.symbol || historyItem.interval !== snapshot.interval,
    );

    analysisHistory.value = [snapshot, ...historyWithoutDuplicate].slice(0, ANALYSIS_HISTORY_MAX_ITEMS);
  }

  function recordSimulation(item: HistoricalSimulationResult) {
    simulationHistory.value = addSimulationHistorySnapshot(
      simulationHistory.value,
      buildSimulationHistorySnapshot(item),
    );
  }

  function buildAnalysisSnapshot(item: AnalyzeResponse): AnalysisHistorySnapshot {
    return {
      symbol: item.symbol,
      interval: item.interval,
      price: item.price,
      action: item.suggestion.action,
      confidence: item.suggestion.confidence,
      createdAt: Date.now(),
    };
  }

  function clearDerivedPanels() {
    historicalSimulation.value = null;
    historicalTimeframeSummary.value = null;
    scoreCalibration.value = null;
    timeframeSummary.value = null;
  }

  onMounted(() => {
    analyze();
    scanSymbols();
  });

  return {
    symbol,
    interval,
    intervals,
    symbolsToScan,
    actionFilter,
    minConfidence,
    actionFilters,
    result,
    historicalSimulation,
    historicalTimeframeSummary,
    scoreCalibration,
    timeframeSummary,
    analysisHistory,
    simulationHistory,
    watchlist,
    watchlistSymbol,
    loading,
    scanLoading,
    simulationLoading,
    historicalTimeframeLoading,
    scoreCalibrationLoading,
    timeframeLoading,
    error,
    scanItems,
    rankingSummary,
    analyze,
    scanSymbols,
    runSimulation,
    loadHistoricalTimeframeSummary,
    loadScoreCalibration,
    loadTimeframeSummary,
    addSymbolToWatchlist,
    addCurrentSymbolToWatchlist,
    removeSymbolFromWatchlist,
    selectWatchlistSymbol,
    selectOpportunity,
    selectTimeframeItem,
    selectHistoryItem,
    selectSimulationHistoryItem,
  };
}
