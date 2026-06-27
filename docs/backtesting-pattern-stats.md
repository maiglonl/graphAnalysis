# Pattern Stats

A simulação histórica agora também gera estatísticas agrupadas por padrão.

Arquivo principal:

```txt
server/utils/historicalSimulation.ts
```

Campo retornado no resultado estendido:

```txt
patternStats
```

Cada item contém:

```txt
patternId
totalTrades
wins
losses
expired
winRate
averageReturn
averageConfidence
```

Objetivo:

- identificar padrões mais recorrentes;
- comparar taxa de acerto por padrão;
- comparar retorno médio por padrão;
- preparar calibração futura dos pesos do scanner.

Observação: este campo ainda usa tipo local estendido no utilitário de simulação histórica.
