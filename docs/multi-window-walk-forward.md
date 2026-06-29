# Walk-forward com múltiplas janelas

A validação walk-forward com uma única divisão reduz overfitting em relação ao backtesting calibrado simples, mas ainda depende de um único ponto de corte. O modo multi-janelas avalia várias fatias do histórico e agrega os resultados.

## Arquivos principais

```txt
server/utils/multiWindowWalkForwardSimulation.ts
server/api/historical-walk-forward-multi.get.ts
app/components/MultiWindowWalkForwardPanel.vue
tests/server/utils/multiWindowWalkForwardSimulation.test.ts
```

## Endpoint

```txt
GET /api/historical-walk-forward-multi
```

### Query params

```txt
symbol     — opcional, default BTCUSDT
interval   — opcional, default 1h
windowCount — opcional, default walkForwardWindowCount (3), clamped entre minWalkForwardWindowCount (1) e maxWalkForwardWindowCount (10)
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

1. Clamp o `windowCount` entre `minWalkForwardWindowCount` e `maxWalkForwardWindowCount`.
2. Divide os candles em `windowCount` fatias sequenciais de tamanho igual.
3. Se os candles forem insuficientes (`<= SCANNER.minCandles + HISTORICAL_SIMULATION.minValidationCandles`), retorna 1 janela com todos os candles.
4. Em cada fatia, roda a validação treino/validação (`runTrainValidationHistoricalSimulation`).
5. Agrega os deltas médios (arredondados a 2 casas decimais) de métricas via `summarizeWindows`.
6. Conta janelas onde `winRateDelta > 0`, `averageReturnDelta > 0` e `maxDrawdownDelta < 0`.

## Constantes relevantes

| Constante | Valor | Local |
|-----------|-------|-------|
| `HISTORICAL_SIMULATION.walkForwardWindowCount` | 3 | constants.ts |
| `HISTORICAL_SIMULATION.minWalkForwardWindowCount` | 1 | constants.ts |
| `HISTORICAL_SIMULATION.maxWalkForwardWindowCount` | 10 | constants.ts |

## Limitações atuais

- Janelas são fatias sequenciais, não rolling; pode haver sobreposição de candles entre janelas.
- Com poucos candles o mínimo de trades por janela pode ser 0, zerando os deltas.
- O resultado de cada janela individual está em `windows[]` mas a UI exibe apenas o `summary`.

## Próximos passos

1. Comparar distribuição de deltas por janela (gráfico de barras).
2. Documentar risco de baixa amostra por janela.
3. Expor seletor de `windowCount` na UI.
