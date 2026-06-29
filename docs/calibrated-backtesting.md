# Backtesting calibrado

A comparação anterior de calibração media apenas o impacto do ajuste sobre a confiança dos trades já simulados. O backtesting calibrado adiciona uma segunda simulação para comparar métricas completas antes/depois da calibração.

## Arquivos principais

```txt
server/utils/calibratedHistoricalSimulation.ts
server/api/historical-calibrated-simulation.get.ts
shared/utils/scoreCalibration.ts
shared/utils/calibrationImpact.ts
```

## Fluxo

1. Roda `runHistoricalSimulation()` para obter a simulação bruta.
2. Usa `raw.patternStats` para criar `buildScoreCalibration()`.
3. Reprocessa os candles e recalcula cada sugestão.
4. Aplica `getSuggestionScoreAdjustment()` antes do filtro de confiança mínima.
5. Gera uma nova simulação com a confiança calibrada.
6. Compara métricas brutas e calibradas.

## Endpoint

```txt
GET /api/historical-calibrated-simulation
```

### Query params

```txt
symbol — opcional, default BTCUSDT
interval — opcional, default 1h
```

### Retorno

```ts
type CalibratedHistoricalSimulationResult = {
  symbol: string
  interval: IntervalEnum
  raw: HistoricalSimulationResult
  calibrated: HistoricalSimulationResult
  calibration: ScoreCalibrationResult
  comparison: {
    totalTradesDelta: number
    winRateDelta: number
    averageReturnDelta: number
    maxDrawdownDelta: number
    averageConfidenceDelta: number
  }
}
```

## Diferença para `calibrationImpact`

`calibrationImpact` mede apenas como a confiança dos trades já simulados mudaria após calibração.

`historical-calibrated-simulation` roda uma segunda simulação aplicando a confiança calibrada antes do filtro mínimo, então pode alterar:

- quantidade de trades;
- taxa de acerto;
- retorno médio;
- drawdown;
- confiança média.

## Helpers compartilhados

Os helpers de simulação foram extraídos para `server/utils/historicalSimulationCore.ts`:

```ts
isActionableSuggestion()
resolveHistoricalTrade()
buildHistoricalSimulationMetrics()
buildHistoricalPatternStats()
buildHistoricalSimulationResult()
```

Tanto `historicalSimulation.ts` quanto `calibratedHistoricalSimulation.ts` importam desse módulo, garantindo comportamento idêntico na resolução de trades e cálculo de métricas.

## Limitações atuais

A calibração ainda usa os próprios candles simulados como base de ajuste, o que pode causar overfitting. Uma próxima melhoria é separar janela de treino e janela de validação.

## Próximos passos

1. Adicionar opção de janela de treino/validação.
2. Documentar claramente que o resultado é pesquisa/avaliação técnica, não recomendação financeira.
