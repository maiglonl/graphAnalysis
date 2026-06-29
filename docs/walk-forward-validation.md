# Validação walk-forward

A simulação calibrada completa compara o histórico bruto com uma segunda execução usando confiança calibrada, mas ainda usa a mesma janela para gerar e avaliar a calibração. A validação walk-forward separa treino e validação para reduzir overfitting.

## Fluxo

1. Divide os candles em treino e validação usando `HISTORICAL_SIMULATION.trainValidationSplitRatio`.
2. Roda `runHistoricalSimulation()` apenas na janela de treino.
3. Cria `buildScoreCalibration(train.patternStats)` com dados de treino.
4. Roda a janela de validação sem calibração.
5. Roda a mesma janela de validação aplicando a calibração antes do filtro mínimo de confiança.
6. Compara métricas brutas e calibradas da janela de validação.

## Arquivos principais

```txt
server/utils/historicalSimulationWindow.ts
server/utils/historicalWindowTrades.ts
server/utils/historicalMetricsComparison.ts
server/utils/trainValidationHistoricalSimulation.ts
server/api/historical-walk-forward.get.ts
```

## Endpoint

```txt
GET /api/historical-walk-forward
```

### Query params

```txt
symbol — opcional, default BTCUSDT
interval — opcional, default 1h
```

### Retorno

```ts
type TrainValidationHistoricalSimulationResult = {
  symbol: string
  interval: IntervalEnum
  window: {
    trainStartIndex: number
    trainEndIndex: number
    validationStartIndex: number
    validationEndIndex: number
    trainCandles: number
    validationCandles: number
  }
  train: HistoricalSimulationResult
  rawValidation: HistoricalSimulationResult
  calibratedValidation: HistoricalSimulationResult
  calibration: ScoreCalibrationResult
  comparison: HistoricalSimulationMetricsComparison
}
```

## Diferença para backtesting calibrado simples

`historical-calibrated-simulation` usa o histórico inteiro para calibrar e avaliar.

`historical-walk-forward` usa treino e validação separados:

- calibração aprende com a janela de treino;
- comparação é feita apenas na janela de validação;
- o resultado é menos otimista e mais útil para avaliar overfitting.

## Limitações atuais

A divisão é fixa e simples. Uma evolução natural é permitir múltiplas janelas walk-forward ou configurar a divisão por query param.

## Próximos passos

1. Adicionar UI para comparar treino, validação bruta e validação calibrada.
2. Permitir query params para split ratio.
3. Implementar múltiplas janelas walk-forward.
4. Documentar o impacto de amostras pequenas.
