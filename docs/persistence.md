# Persistência

Este documento descreve a estratégia atual e futura de persistência.

## Estado atual

A persistência atual é local, usando `localStorage`.

Chaves principais:

```txt
graphAnalysis.symbol
graphAnalysis.interval
graphAnalysis.symbolsToScan
graphAnalysis.actionFilter
graphAnalysis.minConfidence
graphAnalysis.watchlist
graphAnalysis.analysisHistory
graphAnalysis.simulationHistory
graphAnalysis.accountSize
graphAnalysis.riskPercent
```

## Composables

```txt
app/composables/usePersistedRef.ts
app/composables/usePersistedJsonRef.ts
```

`usePersistedRef()` é usado para valores simples.

`usePersistedJsonRef()` é usado para listas e objetos.

## Entidades locais atuais

### Watchlist

Chave:

```txt
graphAnalysis.watchlist
```

Formato:

```ts
string[]
```

### Histórico de análises

Chave:

```txt
graphAnalysis.analysisHistory
```

Formato:

```ts
type AnalysisHistorySnapshot = {
  symbol: string
  interval: IntervalEnum
  price: number | null
  action: TradeActionEnum
  confidence: number
  createdAt: number
}
```

### Histórico de simulações

Chave:

```txt
graphAnalysis.simulationHistory
```

Formato:

```ts
type SimulationHistorySnapshot = {
  symbol: string
  interval: IntervalEnum
  totalTrades: number
  winRate: number
  averageReturn: number
  maxDrawdown: number
  createdAt: number
}
```

## Futuro banco

Banco sugerido:

```txt
PostgreSQL via Supabase
```

## Tabelas sugeridas

### `watchlists`

```txt
id
user_id
name
created_at
updated_at
```

### `watchlist_symbols`

```txt
id
watchlist_id
symbol
position
created_at
```

### `analysis_snapshots`

```txt
id
user_id
symbol
interval
price
action
confidence
payload
created_at
```

### `simulation_runs`

```txt
id
user_id
symbol
interval
total_trades
wins
losses
expired
win_rate
loss_rate
average_risk_reward
average_return
max_drawdown
average_confidence
payload
created_at
```

### `simulation_trades`

```txt
id
simulation_run_id
entry_time
exit_time
action
entry
stop
target
result
patterns
confidence
created_at
```

### `score_calibrations`

```txt
id
user_id
symbol
interval
pattern_adjustments
created_at
```

### `settings`

```txt
id
user_id
key
value
updated_at
```

## Estratégia de migração

1. Manter `localStorage` como fallback.
2. Criar camada de repositório para leitura/escrita.
3. Trocar o composable para consumir o repositório.
4. Sincronizar dados locais para o banco quando usuário estiver autenticado.
5. Evitar acoplar componentes Vue diretamente ao Supabase.

## Regras

1. Componentes não devem acessar `localStorage` diretamente.
2. Componentes não devem acessar Supabase diretamente.
3. O composable coordena estado de tela.
4. Utilitários puros montam snapshots e normalizam dados.
5. Dados pesados, como trades completos, devem ir para banco no futuro; localmente, salvar apenas resumo.
