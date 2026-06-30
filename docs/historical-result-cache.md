# Cache de resultados históricos

Os endpoints históricos e de calibração podem ser pesados porque reprocessam centenas de candles, detectores e simulações. Para reduzir recomputações em refreshes próximos, existe um cache em memória para resultados históricos.

## Arquivos principais

```txt
server/utils/historicalResultCache.ts
```

## Constantes

Configurado em `shared/utils/detectors/constants.ts`:

```ts
HISTORICAL_SIMULATION.resultCacheTtlMs
HISTORICAL_SIMULATION.resultCacheMaxEntries
```

## Endpoints usando cache

```txt
GET /api/historical-simulation
GET /api/historical-score-calibration
GET /api/historical-calibrated-simulation
GET /api/historical-walk-forward-multi
```

## Chave do cache

A chave inclui:

```txt
kind
symbol
interval
limit
variant
```

`variant` é usado para variações do mesmo endpoint, como `windowCount` no walk-forward multi-janelas.

## Limitações

- Cache é apenas em memória.
- Cache é por instância do servidor.
- Cache é perdido em restart/deploy.
- Ainda não existe endpoint administrativo para limpar cache.

## Próximos passos

1. Adicionar endpoint administrativo seguro para limpar cache.
2. Expor metadados de cache em logs ou headers.
3. Considerar Redis/Supabase para cache persistente se a aplicação escalar horizontalmente.
4. Permitir bypass via query param `refresh=true`.
