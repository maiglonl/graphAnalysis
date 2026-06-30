# Cache de resultados históricos

Endpoints históricos são computacionalmente pesados (backtesting completo, calibração, walk-forward). Um cache em memória evita recomputação para o mesmo símbolo/intervalo dentro da janela de TTL.

## Arquivos

```txt
server/utils/historicalResultCache.ts
tests/server/utils/historicalResultCache.test.ts
```

## Endpoints cacheados

| Endpoint | Kind | Variant |
|----------|------|---------|
| `/api/historical-simulation` | `historicalSimulation` | — |
| `/api/historical-score-calibration` | `historicalScoreCalibration` | — |
| `/api/historical-calibrated-simulation` | `historicalCalibratedSimulation` | — |
| `/api/historical-walk-forward` | `historicalWalkForward` | — |
| `/api/historical-walk-forward-multi` | `historicalWalkForwardMulti` | `windowCount` |

## Constantes

| Constante | Valor | Significado |
|-----------|-------|-------------|
| `HISTORICAL_SIMULATION.resultCacheTtlMs` | 300 000 ms (5 min) | TTL de cada entrada |
| `HISTORICAL_SIMULATION.resultCacheMaxEntries` | 25 | Máximo de entradas; excedendo, a mais antiga é removida |

## API do cache

```ts
createHistoricalResultCacheKey(kind, symbol, interval, limit, variant?)
getCachedHistoricalResult<T>(key)
setCachedHistoricalResult<T>(key, value)
clearHistoricalResultCache()
getOrSetHistoricalEndpointCache<T>(key, refresh, factory)
```

`getOrSetHistoricalEndpointCache` é o helper que todos os endpoints usam. Se `refresh=false` e a entrada existe e não expirou, retorna o valor cacheado sem chamar `factory`. Se `refresh=true`, sempre chama `factory` e salva o resultado.

## Bypass via query param

Adicionar `?refresh=true` a qualquer endpoint cacheado força recomputação:

```
GET /api/historical-simulation?symbol=BTCUSDT&interval=1h&refresh=true
```

O dashboard passa `refresh=true` em todas as chamadas disparadas por ação manual (clique no botão de atualizar).

## Chave do cache

```txt
kind:symbol:interval:limit:variant
```

`variant` diferencia variações do mesmo endpoint — ex: `windowCount` para o walk-forward multi-janelas. Sempre é um inteiro (o endpoint arredonda antes de criar a chave).

## Comportamento de prune

Quando `cache.size > resultCacheMaxEntries` após um `set`, as entradas mais antigas (por `createdAt`) são removidas até `cache.size === resultCacheMaxEntries`.

## Limitações

- Cache é em memória; perdido em restart/deploy.
- Cache é por instância do servidor.
- Não há invalidação por mudança de dados no provider externo; respeitar o TTL.
- Diferentes `windowCount` para o mesmo símbolo/intervalo ocupam entradas separadas.

## Próximos passos

1. Endpoint administrativo seguro para limpar cache.
2. Expor metadados de cache em headers de resposta.
3. Redis/Supabase para cache persistente em escala horizontal.
