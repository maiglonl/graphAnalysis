# Dashboard

Este documento registra a evolução da tela principal para uma experiência mais próxima de ferramenta de mercado.

## Estado atual

A página principal já é orquestrada por:

```txt
app/pages/index.vue
app/composables/useTechnicalScannerDashboard.ts
```

Componentes atuais:

```txt
AnalysisForm
WatchlistPanel
AnalysisHistoryPanel
OpportunityRanking
TimeframeSummaryPanel
HistoricalSimulationPanel
SimulationHistoryPanel
HistoricalTimeframeSummaryPanel
ScoreCalibrationPanel
ChartPanel
DetectedPatterns
SuggestionCard
```

## Responsabilidade atual dos painéis

### Watchlist

Acesso rápido a ativos salvos localmente.

### Histórico de análises

Reabre análises recentes por símbolo e timeframe.

### Ranking de oportunidades

Executa scan em lote e permite selecionar o melhor resultado.

### Confirmação multi-timeframe

Compara o mesmo ativo em diferentes timeframes.

### Simulação histórica

Executa backtest simples do ativo/timeframe atual.

### Histórico de simulações

Mantém resumos recentes de simulações locais.

### Calibração do score

Mostra ajustes informativos por padrão com base em performance histórica.

## Próximos componentes sugeridos

```txt
DashboardStatsPanel
PatternPerformancePanel
BacktestTradeList
SettingsPanel
```

## Critérios

1. A página deve continuar apenas orquestrando componentes.
2. Estado e chamadas de API ficam no composable.
3. Cálculos reutilizáveis devem ficar em `app/utils` ou `shared/utils`.
4. Textos visíveis devem usar i18n.
5. Painéis devem ser pequenos e independentes.
