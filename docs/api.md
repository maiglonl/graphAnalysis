# API — graphAnalysis

Este documento descreve os endpoints server-side atuais do projeto.

Todos os erros retornados pela API devem usar chaves i18n no formato `errors.<key>`.

---

## `GET /api/candles`

Busca candles normalizados a partir do provider configurado em `server/utils/marketData`.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |
| `limit` | `number` | não | Quantidade de candles, limitada pelas constantes `API.candleLimitMin` e `API.candleLimitMax`. |

### Exemplo

```txt
/api/candles?symbol=BTCUSDT&interval=1h&limit=500
```

### Retorno

```ts
type CandlesResponse = {
  symbol: string
  interval: IntervalEnum
  candles: Candle[]
}
```

### Observações

- Usa cache em memória via `server/utils/candleCache.ts`.
- O cache é separado por `symbol:interval:limit`.
- Erros externos são normalizados por `MarketDataProviderError`.

---

## `GET /api/analyze`

Executa uma análise completa para um único ativo.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |

### Exemplo

```txt
/api/analyze?symbol=ETHUSDT&interval=4h
```

### Retorno

```ts
type AnalyzeResponse = {
  symbol: string
  interval: IntervalEnum
  price: number | null
  updatedAt: number | null
  candles: Candle[]
  suggestion: TradeSuggestion
  patterns: PatternSignal[]
  signalQualitySummary: SignalQualitySummary
  structure: MarketStructure
  disclaimer: string
}
```

`signalQualitySummary` agrupa os sinais detectados por família e por papel:

```ts
type SignalQualitySummary = {
  byFamily: SignalQualitySummaryItem[]
  byRole: SignalQualitySummaryItem[]
}

type SignalQualitySummaryItem = {
  key: string
  total: number
  bullish: number
  bearish: number
  neutral: number
  averageConfidence: number
}
```

### Fluxo interno

1. Busca candles via `/api/candles`.
2. Cria `ScanContext`.
3. Executa `scanPatterns()`.
4. Executa `buildSuggestion()`.
5. Calcula `getMarketStructure()`.
6. Calcula `summarizeSignalsByQuality()`.
7. Retorna `AnalyzeResponse`.

---

## `GET /api/analyze-calibrated`

Executa análise completa e aplica calibração histórica de score de forma explícita.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |

### Exemplo

```txt
/api/analyze-calibrated?symbol=ETHUSDT&interval=4h
```

### Retorno

```ts
type AnalyzeMarketWithCalibrationResponse = AnalyzeResponse & {
  calibrationAdjustment: number
}
```

### Observações

- Endpoint experimental separado de `/api/analyze`.
- Usa a simulação histórica do mesmo ativo/timeframe para gerar `patternStats`.
- Aplica o ajuste com `applyScoreCalibration()`.
- Retorna também `signalQualitySummary`, herdado de `AnalyzeResponse`.

---

## `GET /api/scan`

Executa análise em lote para até 10 ativos e retorna os itens ordenados por confiança.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbols` | `string` | não | Lista separada por vírgula. |
| `symbol` | `string` | não | Alternativa para analisar um único ativo. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |

### Exemplo

```txt
/api/scan?symbols=BTCUSDT,ETHUSDT,SOLUSDT&interval=1h
```

### Retorno

```ts
type ScanListResponse = {
  interval: IntervalEnum
  items: AnalyzeResponse[]
}
```

### Observações

- O limite atual é de 10 símbolos por chamada.
- A execução é sequencial para reduzir pressão no provider externo.
- Os resultados são ordenados por `suggestion.confidence` em ordem decrescente.

---

## `GET /api/multi-timeframe`

Executa análise do mesmo ativo em múltiplos timeframes.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `intervals` | `string` | não | Lista de timeframes separada por vírgula. Default: `15m,1h,4h,1d`. |

### Exemplo

```txt
/api/multi-timeframe?symbol=BTCUSDT&intervals=15m,1h,4h,1d
```

### Retorno

```ts
type MultiTimeframeResponse = {
  symbol: string
  items: AnalyzeResponse[]
}
```

### Observações

- O limite atual é de 4 timeframes por chamada.
- A execução é sequencial para reduzir pressão no provider externo.
- A UI usa este endpoint para comparar ação e confiança por timeframe.
- O alias `/api/timeframe-summary` continua disponível para compatibilidade.

---

## `GET /api/historical-simulation`

Executa uma simulação histórica simples para um ativo usando os candles disponíveis.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |

### Exemplo

```txt
/api/historical-simulation?symbol=BTCUSDT&interval=1h
```

### Retorno

```ts
type HistoricalSimulationResult = {
  symbol: string
  interval: IntervalEnum
  trades: HistoricalTrade[]
  patternStats: HistoricalPatternStat[]
  familyStats: HistoricalPatternFamilyStat[]
  metrics: {
    totalTrades: number
    wins: number
    losses: number
    expired: number
    winRate: number
    lossRate: number
    averageRiskReward: number
    averageReturn: number
    maxDrawdown: number
    averageConfidence: number
  }
}
```

`familyStats` agrega os resultados por família de padrão para facilitar comparação entre candles, estrutura, liquidez, momentum e outras famílias.

### Observações

- Usa `HISTORICAL_SIMULATION.maxLookaheadCandles` para limitar a janela futura.
- Usa `HISTORICAL_SIMULATION.minConfidence` para filtrar sinais fracos.
- Considera o primeiro alvo da sugestão como alvo da operação simulada.
- Esta simulação é uma métrica técnica auxiliar, não uma recomendação financeira.

---

## `GET /api/historical-timeframe-summary`

Executa simulação histórica em múltiplos timeframes para o mesmo ativo.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `intervals` | `string` | não | Lista de timeframes separada por vírgula. Default: `15m,1h,4h,1d`. |

### Exemplo

```txt
/api/historical-timeframe-summary?symbol=BTCUSDT&intervals=15m,1h,4h,1d
```

### Retorno

```ts
type HistoricalTimeframeSummaryResponse = {
  symbol: string
  items: HistoricalSimulationResult[]
}
```

---

## `GET /api/historical-score-calibration`

Calcula ajustes informativos de score por padrão, família e papel do sinal usando a simulação histórica.

### Query params

| Param | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `symbol` | `string` | não | Ativo analisado. Default: `BTCUSDT`. |
| `interval` | `IntervalEnum` | não | Timeframe. Default: `1h`. |

### Exemplo

```txt
/api/historical-score-calibration?symbol=BTCUSDT&interval=1h
```

### Retorno

```ts
type HistoricalScoreCalibrationResult = {
  symbol: string
  interval: IntervalEnum
  patternAdjustments: PatternScoreCalibration[]
  signalQualityAdjustments: {
    familyAdjustments: SignalQualityScoreCalibration[]
    roleAdjustments: SignalQualityScoreCalibration[]
  }
  calibrationImpact: CalibrationImpactSummary
}

type CalibrationImpactSummary = {
  totalTrades: number
  adjustedTrades: number
  positiveAdjustments: number
  negativeAdjustments: number
  neutralAdjustments: number
  averageAdjustment: number
  averageRawConfidence: number
  averageCalibratedConfidence: number
  confidenceDelta: number
  maxPositiveAdjustment: number
  maxNegativeAdjustment: number
  trades: CalibrationImpactTrade[]
}
```

### Observações

- A calibração atual é informativa.
- Padrões com amostra baixa recebem ajuste neutro.
- Família e papel complementam a calibração individual para reduzir dependência de padrões raros com pouca amostra.
- `calibrationImpact` compara a confiança original dos trades simulados com a confiança calibrada.

---

## `GET /api/historical-calibrated-simulation`

Roda a simulação bruta, calcula calibração e roda uma segunda simulação com confiança calibrada, comparando as métricas.

### Query params

| Param | Padrão |
| --- | --- |
| `symbol` | `BTCUSDT` |
| `interval` | `1h` |

### Retorno

```ts
type CalibratedHistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  raw: HistoricalSimulationResult;
  calibrated: HistoricalSimulationResult;
  calibration: ScoreCalibrationResult;
  comparison: {
    totalTradesDelta: number;
    winRateDelta: number;
    averageReturnDelta: number;
    maxDrawdownDelta: number;
    averageConfidenceDelta: number;
  };
};
```

### Observações

- `raw` e `calibrated` têm o mesmo shape que `/api/historical-simulation`.
- A calibração é construída com os `patternStats` da simulação bruta.
- A segunda simulação aplica `getSuggestionScoreAdjustment()` antes do filtro `minConfidence`.
- Resultado informativo; calibração usa os mesmos candles, o que pode causar overfitting.

---

## Erros conhecidos

| Chave | Significado |
| --- | --- |
| `errors.invalidSymbol` | Símbolo inválido. |
| `errors.invalidInterval` | Timeframe inválido. |
| `errors.rateLimited` | Provider externo retornou limite de requisições. |
| `errors.timeout` | Provider externo não respondeu a tempo. |
| `errors.emptyResponse` | Provider externo não retornou candles. |
| `errors.providerUnavailable` | Provider externo indisponível. |
| `errors.analyzeDefault` | Erro genérico de análise. |
