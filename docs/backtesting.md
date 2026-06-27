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

O retorno mantém as métricas públicas já usadas pela UI:

```txt
totalTrades
wins
losses
expired
winRate
averageRiskReward
```

O utilitário também calcula métricas extras para evoluções de backtest:

```txt
lossRate
averageReturn
maxDrawdown
averageConfidence
```

Essas métricas extras ainda usam tipo local estendido porque o tipo compartilhado não foi alterado nesta etapa.

## Limitações conhecidas

1. Usa apenas o primeiro alvo.
2. Não calcula retorno composto.
3. Não separa performance por padrão.
4. Não separa performance por timeframe.
5. Não persiste execuções.
6. Não considera custos, slippage ou spread.

## Próximas evoluções

1. Persistir execuções de simulação.
2. Agrupar resultado por padrão.
3. Agrupar resultado por timeframe.
4. Calcular retorno por operação com mais detalhes.
5. Usar métricas históricas para calibrar pesos do scanner.
