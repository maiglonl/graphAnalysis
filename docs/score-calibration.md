# Score Calibration

Este documento descreve a camada inicial de calibração do score com base em resultados históricos.

## Arquivos principais

```txt
shared/utils/scoreCalibration.ts
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
4. O ajuste final é limitado por `SCORE_CALIBRATION.maxAdjustment`.

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

Nesta etapa, a calibração é apenas informativa. Ela ainda não altera automaticamente a confiança operacional do scanner.
