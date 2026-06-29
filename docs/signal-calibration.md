# Calibração por família e papel do sinal

A calibração histórica começou por padrão individual em `shared/utils/scoreCalibration.ts`. Com a expansão para mais de 100 padrões, apenas calibrar cada padrão isoladamente tende a sofrer com baixa amostra por padrão.

A fase atual adiciona uma camada complementar:

- ajuste por padrão individual;
- ajuste por família do padrão;
- ajuste por papel do sinal;
- resumo de impacto antes/depois da calibração.

## Arquivos principais

```txt
shared/utils/patternFamilies.ts
shared/utils/patternFamilyStats.ts
shared/utils/signalQualityCalibration.ts
shared/utils/scoreCalibration.ts
shared/utils/calibratedSuggestion.ts
shared/utils/calibrationImpact.ts
```

## Fluxo atual

1. O backtesting gera `patternStats` por padrão.
2. `buildScoreCalibration(patternStats)` calcula:
   - `patternAdjustments` por padrão;
   - `signalQualityAdjustments.familyAdjustments` por família;
   - `signalQualityAdjustments.roleAdjustments` por papel.
3. `applyScoreCalibration()` usa `getSuggestionScoreAdjustment()` para ajustar a sugestão.
4. O ajuste por família/papel é aplicado uma vez por sugestão, não uma vez por padrão, evitando multiplicar o mesmo ajuste quando vários sinais da mesma família aparecem juntos.
5. `summarizeCalibrationImpact()` compara a confiança original dos trades simulados com a confiança calibrada.

## Por que calibrar por família

Alguns padrões raros podem ter pouca amostra individual, mas pertencem a uma família com histórico estatístico maior. Exemplo:

- `BreakerBlockBullish` pode ter pouca amostra;
- a família `Liquidity` pode ter amostra suficiente;
- a sugestão ainda recebe um ajuste conservador baseado na família.

## Por que calibrar por papel

O papel do sinal separa:

```txt
Actionable
Context
Warning
```

Isso permite identificar se sinais contextuais ou alertas estão ajudando ou atrapalhando historicamente.

## Impacto da calibração

`shared/utils/calibrationImpact.ts` gera um resumo com:

```txt
totalTrades
adjustedTrades
positiveAdjustments
negativeAdjustments
neutralAdjustments
averageAdjustment
averageRawConfidence
averageCalibratedConfidence
confidenceDelta
maxPositiveAdjustment
maxNegativeAdjustment
trades
```

Esse resumo é exposto por `/api/historical-score-calibration` no campo `calibrationImpact`.

`buildHistoricalScoreCalibration()` inclui automaticamente `calibrationImpact` no resultado.

O painel `ScoreCalibrationPanel.vue` exibe o resumo de impacto (cards + linha de breakdown) antes das tabelas de ajustes por família/papel e dos cards por padrão.

A comparação atual mede impacto na confiança dos trades já simulados. Ela não reexecuta o backtesting filtrando por confiança calibrada, então deve ser interpretada como métrica de impacto de score, não como resultado final de estratégia calibrada.

## Pontos de atenção

- A calibração por padrão continua sendo a mais específica.
- Família e papel devem complementar, não substituir, o ajuste por padrão.
- O total é limitado por `SCORE_CALIBRATION.maxTotalAdjustment`.
- O formato de resposta da API de calibração contém metadados adicionais; validar consumidores no frontend.
- A comparação antes/depois atual é informativa e não elimina risco de overfitting.

## Próximos passos

1. Exibir família/papel no painel de backtesting.
3. Adicionar filtros por família no dashboard.
4. Criar simulação calibrada separada para comparar métricas completas antes/depois.
5. Criar testes de integração para `/api/analyze-calibrated` e `/api/historical-score-calibration`.
