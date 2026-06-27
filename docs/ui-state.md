# UI State

Resumo dos estados locais usados pela interface.

## LocalStorage

```txt
graphAnalysis.symbol
graphAnalysis.interval
graphAnalysis.symbolsToScan
graphAnalysis.actionFilter
graphAnalysis.minConfidence
graphAnalysis.accountSize
graphAnalysis.riskPercent
```

## Tela inicial

`app/pages/index.vue` orquestra a composição visual da tela e consome `useTechnicalScannerDashboard()`.

A página não deve concentrar chamadas de API nem regra de estado. Essa responsabilidade fica no composable.

## Composable principal

```txt
app/composables/useTechnicalScannerDashboard.ts
```

Responsabilidades:

- estado persistido do scanner;
- análise individual;
- scan em lote;
- simulação histórica;
- confirmação por timeframe;
- seleção de oportunidade;
- seleção de timeframe;
- limpeza de painéis derivados;
- resolução centralizada de erros via `app/utils/apiErrors.ts`.

## Componentes de painel

```txt
app/components/OpportunityRanking.vue
app/components/TimeframeSummaryPanel.vue
app/components/HistoricalSimulationPanel.vue
```

### `OpportunityRanking.vue`

Controla a UI do ranking, incluindo lista de símbolos, filtro por ação e filtro por confiança mínima.

### `TimeframeSummaryPanel.vue`

Controla a UI de confirmação multi-timeframe usando os dados de `/api/timeframe-summary`.

### `HistoricalSimulationPanel.vue`

Controla a UI da simulação histórica usando os dados de `/api/historical-simulation`.

## Card de sugestão

`app/components/SuggestionCard.vue` controla os campos de gestão de risco e usa `shared/utils/riskPlan.ts` para calcular o plano.
