# Simulação Histórica

Este documento descreve o MVP atual de avaliação histórica dos sinais.

## Arquivos principais

```txt
server/utils/historicalSimulation.ts
server/api/historical-simulation.get.ts
```

## Fluxo atual

Para cada candle histórico com janela mínima suficiente:

1. monta uma visão parcial dos candles até aquele ponto;
2. executa `scanPatterns()`;
3. executa `buildSuggestion()`;
4. ignora sinais sem ação operacional;
5. ignora sinais abaixo da confiança mínima;
6. simula o primeiro alvo contra os candles seguintes;
7. registra o resultado como `win`, `loss` ou `expired`.

## Métricas atuais

O retorno da simulação inclui:

```txt
totalTrades
wins
losses
expired
winRate
lossRate
averageRiskReward
averageReturn
maxDrawdown
averageConfidence
```

## Estatísticas por padrão

O resultado também inclui:

```txt
patternStats
```

Cada item agrupa:

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

Isso prepara a próxima etapa de calibrar pesos do scanner a partir da performance histórica por padrão.

## Limitações conhecidas

1. Usa apenas o primeiro alvo.
2. Não calcula retorno composto.
3. Não separa performance por timeframe.
4. Não persiste execuções.
5. Não considera custos, slippage ou spread.

## Próximas evoluções

1. Agrupar resultado por timeframe.
2. Calcular retorno por operação com mais detalhes.
3. Usar métricas históricas para calibrar pesos do scanner.
4. Persistir execuções de simulação.
