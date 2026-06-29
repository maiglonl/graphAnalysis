# Walk-forward com múltiplas janelas

A validação walk-forward com uma única divisão reduz overfitting em relação ao backtesting calibrado simples, mas ainda depende de um único ponto de corte. O modo multi-janelas avalia várias fatias do histórico e agrega os resultados.

## Arquivos principais

```txt
server/utils/multiWindowWalkForwardSimulation.ts
server/api/historical-walk-forward-multi.get.ts
tests/server/utils/multiWindowWalkForwardSimulation.test.ts
```

## Endpoint

```txt
GET /api/historical-walk-forward-multi
```

### Query params

```txt
symbol — opcional, default BTCUSDT
interval — opcional, default 1h
```

## Retorno

```ts
type MultiWindowWalkForwardSimulationResult = {
  symbol: string
  interval: IntervalEnum
  windows: TrainValidationHistoricalSimulationResult[]
  summary: {
    windows: number
    totalTradesDelta: number
    winRateDelta: number
    averageReturnDelta: number
    maxDrawdownDelta: number
    averageConfidenceDelta: number
    improvedWinRateWindows: number
    improvedReturnWindows: number
    reducedDrawdownWindows: number
  }
}
```

## Como funciona

1. Divide os candles em múltiplas fatias usando `HISTORICAL_SIMULATION.walkForwardWindowCount`.
2. Em cada fatia, roda a validação treino/validação existente.
3. Agrega os deltas médios de métricas.
4. Conta quantas janelas melhoraram win rate, retorno médio e drawdown.

## Limitações atuais

- As janelas são fatias sequenciais simples, não necessariamente rolling windows totalmente configuráveis.
- A quantidade de janelas é fixa em constante.
- O endpoint ainda não aceita query param para configurar o número de janelas.
- A UI ainda precisa exibir o resumo multi-janelas.

## Próximos passos

1. Permitir `windowCount` via query param com limites seguros.
2. Exibir resumo multi-janelas no dashboard.
3. Comparar distribuição de deltas por janela.
4. Adicionar gráfico simples de deltas por janela.
5. Documentar risco de baixa amostra por janela.
