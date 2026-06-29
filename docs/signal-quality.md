# Qualidade dos sinais

A expansão de padrões chegou a 116 sinais. A fase atual deixou de ser quantidade e passou a ser qualidade: reduzir ruído, separar contexto de ação e melhorar a leitura do score.

## Famílias

Os padrões são classificados por família em `shared/utils/patternFamilies.ts`:

```txt
Candle       — candles isolados e multi-candle (hammer, engulfing, doji, stars…)
Structure    — FVG, BOS, CHOCH, HH/HL/LH/LL
PriceAction  — padrões gráficos compostos (H&S, flags, triângulos…)
Volume       — sinais baseados em volume relativo
Volatility   — ATR e squeeze
Trend        — médias móveis e trendlines
Momentum     — RSI, MACD, Stochastic
Liquidity    — order blocks, breaker blocks, sweeps, equal levels
```

**Nota sobre FVG**: `BullishFvg` e `BearishFvg` foram movidos de `Candle` para `Structure` porque FVG é um desequilíbrio estrutural multi-candle (conceito Smart Money/ICT), não um padrão de vela isolado.

## Papel do sinal

Cada padrão possui um papel (`PatternSignalRoleEnum` em `patternFamilies.ts`):

```txt
Actionable — sinal com entrada/stop/targets ou viés direcional claro.
Context    — contexto técnico útil, não deve sozinho decidir operação.
Warning    — alerta de exaustão, liquidez ou risco direcional.
```

## Pesos de qualidade

Os pesos que compõem o `rank` de cada sinal vivem em `SIGNAL_QUALITY` em `shared/utils/detectors/constants.ts`:

```ts
roleWeight:   { actionable: 3, warning: 2, context: 1 }
familyWeight: { liquidity: 8, structure: 7, priceAction: 6, trend: 5,
                momentum: 4, volume: 3, volatility: 2, candle: 1 }
```

`rank = roleWeight * familyWeight * confidence`

## Utilitários

| Arquivo | Exportações |
|---------|-------------|
| `shared/utils/patternFamilies.ts` | `PatternFamilyEnum`, `PatternSignalRoleEnum`, `getPatternFamily()`, `getPatternSignalRole()` |
| `shared/utils/patternSignalQuality.ts` | `getPatternQualityMetadata()`, `sortPatternsBySignalQuality()`, `getPrimaryActionablePattern()`, `groupPatternsByFamily()`, role helpers |
| `shared/utils/patternNoiseReduction.ts` | `reducePatternNoise()`, `filterSuggestionEligiblePatterns()`, `hasActionableSignal()` |
| `shared/utils/patternFamilyStats.ts` | `PatternFamilyStat`, `aggregatePatternStatsByFamily()` |

## Resumo em tempo real

`summarizeSignalsByQuality(patterns)` em `shared/utils/signalQualitySummary.ts` retorna `SignalQualitySummary`:

```ts
{
  byFamily: SignalQualitySummaryItem[];  // ordenado por total
  byRole:   SignalQualitySummaryItem[];
}
```

Cada item: `{ key: string, total, bullish, bearish, neutral, averageConfidence }`.

O campo `key` é o valor do enum (ex.: `'liquidity'`, `'actionable'`). A UI faz lookup via `$t('signalQuality.families.liquidity')` para traduzir.

Ambos os endpoints (`/api/analyze` e `/api/analyze-calibrated`) incluem `signalQualitySummary` em `AnalyzeResponse`. O componente `SignalQualitySummaryPanel.vue` exibe o resumo.

## Integração no scanner

`Scanner.scan()` aplica `reducePatternNoise()` após deduplicação de BOS/CHOCH:

- sinais acionáveis e de alerta passam integralmente;
- sinais contextuais são limitados a `maxContextSignalsPerFamily` (padrão: 1) por família, mantendo o de maior rank;
- a saída já é ordenada por rank (liquidez/estrutura têm prioridade).

`SuggestionBuilder.build()` aplica `filterSuggestionEligiblePatterns()` antes de calcular score direcional:

- se houver sinais acionáveis com confiança ≥ `minActionableConfidenceForSuggestion` (50), apenas eles são usados no score;
- o padrão principal é escolhido via `getPrimaryActionablePattern()` (maior rank acionável) com fallback para `sortPatternsBySignalQuality()[0]`;
- `reasons` são ordenados por qualidade.

## Estatísticas por família

`aggregatePatternStatsByFamily(patternStats)` de `patternFamilyStats.ts` agrega `HistoricalPatternStat[]` por família. Pode ser chamado sobre o resultado de `runHistoricalSimulation()`:

```ts
import { aggregatePatternStatsByFamily } from '#shared/utils/patternFamilyStats';

const result = runHistoricalSimulation(params);
const byFamily = aggregatePatternStatsByFamily(result.patternStats);
```

A integração de `familyStats` em `HistoricalSimulationResult` ficou para a Fase B do roadmap de qualidade (requer mover `PatternFamilyEnum` para `shared/types/market.ts` para evitar dependência circular).

## Roadmap de qualidade

**Fase A — calibração por backtesting** (ativa)
Usar `historicalSimulation` para medir win rate e retorno médio por padrão e família. Ajustar thresholds nos detectores com menor acurácia.

**Fase B — familyStats em HistoricalSimulationResult**
Mover `PatternFamilyEnum` para `market.ts`. Adicionar `familyStats: PatternFamilyStat[]` ao tipo e popular no `runHistoricalSimulation`.

**Fase C — confluência dirigida**
Pontuar apenas sinais acionáveis que co-ocorrem com pelo menos um sinal de família diferente no mesmo candle (ex.: candle + estrutura, ou momentum + liquidez).
