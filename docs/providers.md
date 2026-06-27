# Market Data Providers — graphAnalysis

Este documento descreve a camada de providers de dados de mercado.

A camada existe para evitar que a aplicação dependa diretamente da Binance dentro dos endpoints.

---

## Estrutura atual

```txt
server/utils/marketData/
  MarketDataProvider.ts
  BinanceProvider.ts
  MarketDataProviderError.ts
  index.ts
```

---

## Interface principal

Arquivo:

```txt
server/utils/marketData/MarketDataProvider.ts
```

Contrato:

```ts
type GetCandlesParams = {
  symbol: string
  interval: IntervalEnum
  limit: number
}

interface MarketDataProvider {
  getCandles(params: GetCandlesParams): Promise<Candle[]>
}
```

Todo provider futuro deve implementar essa interface.

---

## Provider atual

Arquivo:

```txt
server/utils/marketData/BinanceProvider.ts
```

Responsabilidades:

1. Chamar a API pública da Binance.
2. Converter klines para `Candle[]`.
3. Validar resposta vazia.
4. Normalizar erros externos.

---

## Provider exportado

Arquivo:

```txt
server/utils/marketData/index.ts
```

Atualmente:

```ts
export const marketDataProvider: MarketDataProvider = new BinanceProvider()
```

Para trocar de provider futuramente, altere apenas esse arquivo.

---

## Erros normalizados

Arquivo:

```txt
server/utils/marketData/MarketDataProviderError.ts
```

Erros suportados:

```ts
enum MarketDataErrorCodeEnum {
  InvalidSymbol = 'invalidSymbol',
  InvalidInterval = 'invalidInterval',
  RateLimited = 'rateLimited',
  Timeout = 'timeout',
  EmptyResponse = 'emptyResponse',
  ProviderUnavailable = 'providerUnavailable',
}
```

Endpoints devem converter esses erros para chaves i18n:

```txt
errors.invalidSymbol
errors.invalidInterval
errors.rateLimited
errors.timeout
errors.emptyResponse
errors.providerUnavailable
```

---

## Cache

Arquivo:

```txt
server/utils/candleCache.ts
```

Chave:

```ts
type CandleCacheKey = `${string}:${IntervalEnum}:${number}`
```

Formato:

```txt
symbol:interval:limit
```

TTL atual por intervalo:

```txt
1m  -> 15s
5m  -> 30s
15m -> 60s
30m -> 90s
1h  -> 180s
4h  -> 600s
1d  -> 1800s
```

---

## Fluxo atual de `/api/candles`

1. Sanitiza `symbol`.
2. Valida `interval`.
3. Normaliza `limit`.
4. Monta chave de cache.
5. Retorna cache, se existir.
6. Busca candles no provider.
7. Salva candles no cache.
8. Retorna candles normalizados.

---

## Como adicionar novo provider

1. Criar arquivo em `server/utils/marketData`.
2. Implementar `MarketDataProvider`.
3. Normalizar erros usando `MarketDataProviderError`.
4. Exportar nova instância em `index.ts`.
5. Testar `/api/candles`, `/api/analyze` e `/api/scan`.

Exemplo:

```ts
export class CustomProvider implements MarketDataProvider {
  async getCandles(params: GetCandlesParams): Promise<Candle[]> {
    // fetch externo
    // map para Candle[]
  }
}
```

---

## Próximos providers possíveis

- Coinbase;
- Twelve Data;
- Polygon;
- Alpha Vantage;
- Yahoo Finance;
- provider pago para B3.
