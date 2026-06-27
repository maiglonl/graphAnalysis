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
  structure: MarketStructure
  disclaimer: string
}
```

### Fluxo interno

1. Busca candles via `/api/candles`.
2. Cria `ScanContext`.
3. Executa `scanPatterns()`.
4. Executa `buildSuggestion()`.
5. Calcula `getMarketStructure()`.
6. Retorna `AnalyzeResponse`.

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
