# Score Calibration

Este documento descreve a camada inicial de calibração do score com base em resultados históricos.

## Arquivos principais

```txt
shared/utils/scoreCalibration.ts
shared/utils/calibratedSuggestion.ts
server/utils/historicalScoreCalibration.ts
server/api/historical-score-calibration.get.ts
```

## Entrada

A calibração usa `patternStats`, gerado pela simulação histórica.

Cada padrão considera:

```txt
totalTrades
winRate
averageReturn
averageConfidence
```

## Saída

O resultado contém:

```txt
patternAdjustments
```

Cada item informa:

```txt
patternId
sampleSize
adjustment
winRate
averageReturn
averageConfidence
isReliable
```

## Regras atuais

1. Padrões com amostra menor que `SCORE_CALIBRATION.minTrades` não recebem ajuste.
2. O ajuste compara `winRate` contra `SCORE_CALIBRATION.baselineWinRate`.
3. O retorno médio também contribui para o ajuste.
4. O ajuste por padrão é limitado por `SCORE_CALIBRATION.maxAdjustment`.
5. A soma aplicada à sugestão é limitada por `SCORE_CALIBRATION.maxTotalAdjustment`.

## Aplicação opcional

Arquivo:

```txt
shared/utils/calibratedSuggestion.ts
```

Função:

```txt
applyScoreCalibration()
```

Essa função recebe uma `TradeSuggestion` já calculada e um `ScoreCalibrationResult`, retornando:

```txt
suggestion
calibrationAdjustment
```

A função só ajusta sugestões operacionais (`buy`/`sell`). Sugestões `wait` e `none` são preservadas.

## Endpoint

```txt
/api/historical-score-calibration
```

Parâmetros:

```txt
symbol
interval
```

## Observação

A calibração já pode ser calculada e aplicada de forma explícita por utilitário. O scanner padrão ainda não aplica esses ajustes automaticamente.
