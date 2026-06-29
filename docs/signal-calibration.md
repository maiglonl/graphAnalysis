# Calibração por família e papel do sinal

A calibração histórica começou por padrão individual em `shared/utils/scoreCalibration.ts`. Com a expansão para mais de 100 padrões, apenas calibrar cada padrão isoladamente tende a sofrer com baixa amostra por padrão.

A fase atual adiciona uma camada complementar:

- ajuste por padrão individual;
- ajuste por família do padrão;
- ajuste por papel do sinal.

## Arquivos principais

```txt
shared/utils/patternFamilies.ts
shared/utils/patternFamilyStats.ts
shared/utils/signalQualityCalibration.ts
shared/utils/scoreCalibration.ts
shared/utils/calibratedSuggestion.ts
```

## Fluxo atual

1. O backtesting gera `patternStats` por padrão.
2. `buildScoreCalibration(patternStats)` calcula:
   - `patternAdjustments` por padrão;
   - `signalQualityAdjustments.familyAdjustments` por família;
   - `signalQualityAdjustments.roleAdjustments` por papel.
3. `applyScoreCalibration()` usa `getSuggestionScoreAdjustment()` para ajustar a sugestão.
4. O ajuste por família/papel é aplicado uma vez por sugestão, não uma vez por padrão, evitando multiplicar o mesmo ajuste quando vários sinais da mesma família aparecem juntos.

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

## Pontos de atenção

- A calibração por padrão continua sendo a mais específica.
- Família e papel devem complementar, não substituir, o ajuste por padrão.
- O total é limitado por `SCORE_CALIBRATION.maxTotalAdjustment`.
- O formato de resposta da API de calibração agora contém metadados adicionais; validar consumidores no frontend.

## Próximos passos

1. Expor `familyStats` no resultado de simulação histórica.
2. Exibir família/papel no painel de backtesting.
3. Adicionar filtros por família no dashboard.
4. Medir impacto antes/depois da redução de ruído.
5. Criar testes de integração para `/api/analyze-calibrated` e `/api/historical-score-calibration`.
