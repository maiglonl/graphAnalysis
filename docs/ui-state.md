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

`app/pages/index.vue` controla a análise individual, o ranking de oportunidades e os filtros de ranking.

## Card de sugestão

`app/components/SuggestionCard.vue` controla os campos de gestão de risco e usa `shared/utils/riskPlan.ts` para calcular o plano.
