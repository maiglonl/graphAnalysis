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
HistoricalSimulationPanel      — inclui seção familyStats (performance por família)
SimulationHistoryPanel
HistoricalTimeframeSummaryPanel
ScoreCalibrationPanel
CalibratedBacktestingPanel     — compara métricas brutas vs calibradas
WalkForwardValidationPanel     — treino/validação separados, métricas da janela de validação
MultiWindowWalkForwardPanel    — walk-forward em múltiplas fatias, summary dos deltas agregados
SignalQualitySummaryPanel      — resumo de qualidade dos sinais por família e papel
ChartPanel
DetectedPatterns
SuggestionCard
```

### WalkForwardValidationPanel

Exibe `TrainValidationHistoricalSimulationResult`. Mostra dois cards com `trainCandles` e `validationCandles`, depois tabela comparativa raw vs calibrado para a janela de validação (mesmas métricas do `CalibratedBacktestingPanel`, mas comparando apenas a janela de validação).

### MultiWindowWalkForwardPanel

Exibe `MultiWindowWalkForwardSimulationResult`. Mostra o número de janelas, uma grade com os 5 deltas médios (coloridos: verde para melhoria, vermelho para piora, exceto drawdown que é invertido), e uma linha de texto com a contagem de janelas onde cada métrica melhorou.

### CalibratedBacktestingPanel

Exibe `CalibratedHistoricalSimulationResult` com uma tabela comparativa entre simulação bruta e calibrada. Colunas: métrica, valor bruto, valor calibrado, delta. Métricas exibidas: trades, taxa de acerto, retorno médio, drawdown máximo, confiança média. O delta de drawdown usa colorização invertida (redução é positiva). Inclui disclaimer de overfitting.

### ScoreCalibrationPanel

Exibe `HistoricalScoreCalibrationResult` em 4 seções:

1. **Impacto da calibração** — 4 cards (confiança original, confiança calibrada, delta, trades ajustados) + linha de resumo (positivos / negativos / sem ajuste / max positivo / max negativo).
2. **Ajustes por família** — tabela com `signalQualityAdjustments.familyAdjustments`: família, amostra, winRate, retorno médio, ajuste.
3. **Ajustes por papel** — mesma estrutura para `signalQualityAdjustments.roleAdjustments`.
4. **Ajustes por padrão** — cards com `patternAdjustments`: padrão, amostra, winRate, retorno, confiança, reliable/notReliable.

### SignalQualitySummaryPanel

Exibe `signalQualitySummary` de `AnalyzeResponse`. Aparece logo abaixo dos erros, antes da área de gráfico/sugestão.

Mostra duas tabelas: **Por família** e **Por papel**. Colunas: família/papel, total, altistas, baixistas, confiança média.

Os nomes de família/papel são traduzidos via `$t('signalQuality.families.<key>')` e `$t('signalQuality.roles.<key>')`.

### familyStats em HistoricalSimulationPanel

Quando `result.familyStats` tem dados, exibe uma tabela compacta de performance por família com: família, trades, taxa de acerto, retorno médio, confiança média.

Os nomes de família reutilizam `$t('signalQuality.families.<key>')` para consistência visual.

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

## Cache de resultados históricos

Endpoints históricos pesados usam cache em memória (TTL 5 min). Ver `docs/historical-result-cache.md`.

O composable passa `refresh=true` em todas as chamadas disparadas por clique manual nos botões de atualizar, garantindo que o usuário sempre receba dados frescos ao interagir. Carregamentos automáticos futuros podem omitir `refresh=true` para aproveitar o cache.

## Critérios

1. A página deve continuar apenas orquestrando componentes.
2. Estado e chamadas de API ficam no composable.
3. Cálculos reutilizáveis devem ficar em `app/utils` ou `shared/utils`.
4. Textos visíveis devem usar i18n.
5. Painéis devem ser pequenos e independentes.
