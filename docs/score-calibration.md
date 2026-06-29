# Score Calibration

Este documento descreve a camada de calibração do score com base em resultados históricos.

## Arquivos principais

```txt
shared/utils/signalQualityCalibration.ts
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

O resultado (`ScoreCalibrationResult`) contém:

```txt
patternAdjustments       — ajuste individual por padrão
signalQualityAdjustments
  familyAdjustments      — ajuste agregado por família (PatternFamilyEnum)
  roleAdjustments        — ajuste agregado por papel (PatternSignalRoleEnum)
```

Cada item em `patternAdjustments`:

```txt
patternId
sampleSize
adjustment
winRate
averageReturn
averageConfidence
isReliable
```

Cada item em `familyAdjustments` tem `key: PatternFamilyEnum`. Em `roleAdjustments`, `key: PatternSignalRoleEnum`.

## Regras de ajuste

1. **Ajuste individual por padrão** — calcula a partir de `stat.winRate` e `stat.averageReturn` do padrão diretamente.
2. **Ajuste por família** — agrega `wins/totalTrades` de todos os padrões da mesma família; usa `SCORE_CALIBRATION.minTrades` para decidir se é confiável.
3. **Ajuste por papel** — agrega os padrões pelo `PatternSignalRoleEnum`; mesma lógica.
4. **Clamp individual** — cada ajuste de padrão, família ou papel é limitado por `±SCORE_CALIBRATION.maxAdjustment` (8).
5. **Clamp total por padrão** — `getPatternScoreAdjustment()` soma padrão + família + papel e clamp em `±SCORE_CALIBRATION.maxTotalAdjustment` (12).
6. **Clamp total por sugestão** — `getSuggestionScoreAdjustment()` soma todos os `patternAdjustments` das reasons, mais **uma vez** por família presente e **uma vez** por papel presente. Total limitado pelo mesmo clamp.

### Por que família/papel é aplicado uma vez por sugestão

Quando uma sugestão tem múltiplos sinais da mesma família (ex.: dois Liquidity), somar o ajuste da família duas vezes duplicaria o mesmo efeito histórico agregado. O ajuste por família/papel é uma propriedade do sinal coletivo, não de cada reason individualmente.

## Aplicação

Arquivo: `shared/utils/calibratedSuggestion.ts`

Função: `applyScoreCalibration(suggestion, calibration)`

Retorna `{ suggestion, calibrationAdjustment }`. Só ajusta sugestões `buy`/`sell` — `wait` é preservado intacto.

## Endpoint

```txt
GET /api/historical-score-calibration?symbol=BTCUSDT&interval=1h
```

O resultado (`HistoricalScoreCalibrationResult`) estende `ScoreCalibrationResult` com `symbol` e `interval`. Contém `patternAdjustments` + `signalQualityAdjustments`.

## Observação

O scanner padrão ainda não aplica esses ajustes. A calibração é aplicada pelo endpoint `analyze-calibrated`.
