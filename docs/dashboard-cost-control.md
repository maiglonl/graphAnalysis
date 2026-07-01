# Controle de custo do dashboard

Os backtests, calibrações e walk-forward são as operações mais caras do dashboard. A estratégia atual combina carregamento sob demanda, cache em memória e bypass manual.

## Comportamento atual

- Análise principal e scanner carregam automaticamente no `onMounted`.
- Painéis históricos/calibração/walk-forward são carregados por ação do usuário.
- Botões manuais usam `refresh=true` para forçar recomputação.
- Requisições automáticas ou futuras pré-cargas devem evitar `refresh=true` para aproveitar cache.

## Endpoints pesados com cache

```txt
/api/historical-simulation
/api/historical-score-calibration
/api/historical-calibrated-simulation
/api/historical-walk-forward
/api/historical-walk-forward-multi
```

## Endpoint de status

```txt
/api/historical-cache-status
```

Retorna tamanho do cache, TTL, entradas por tipo e TTL restante de cada entrada.

Esse endpoint pode alimentar um painel de debug/observabilidade no dashboard sem expor o conteúdo cacheado.

## Regras de uso sugeridas

### Carregamento automático

Usar cache normal:

```txt
refresh=false ou ausente
```

### Clique manual em atualizar

Forçar recomputação:

```txt
refresh=true
```

### Status de cache

Pode ser carregado junto com o dashboard ou após cada backtest pesado.

## Próximas melhorias

1. Integrar `historical-cache-status` no dashboard.
2. Mostrar `cache.size`, `maxEntries`, `ttlMs` e entradas por tipo.
3. Adicionar indicador visual de “cache usado” vs “recomputado” nos painéis.
4. Evitar chamadas concorrentes para o mesmo endpoint/símbolo/intervalo.
5. Considerar cache persistente externo se houver múltiplas instâncias do servidor.
