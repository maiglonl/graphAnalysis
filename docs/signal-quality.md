# Qualidade dos sinais

A expansão de padrões chegou a mais de 100 sinais. A próxima etapa deixa de ser quantidade e passa a ser qualidade: reduzir ruído, separar contexto de ação e melhorar a leitura do score.

## Famílias

Os padrões são classificados por família em `shared/utils/patternFamilies.ts`:

```txt
Candle
Structure
PriceAction
Volume
Volatility
Trend
Momentum
Liquidity
```

Essa classificação permite:

- agrupar motivos no dashboard;
- medir performance por família no backtesting;
- filtrar sinais contextuais;
- reduzir conflitos entre padrões equivalentes.

## Papel do sinal

Cada padrão também possui um papel:

```txt
Actionable — sinal com entrada/stop/targets ou viés direcional claro.
Context — contexto técnico útil, mas que não deveria sozinho decidir uma operação.
Warning — alerta de exaustão, liquidez ou risco direcional.
```

## Priorização

`shared/utils/patternSignalQuality.ts` calcula metadados de qualidade:

- família;
- papel do sinal;
- ranking baseado em papel, família e confiança.

A ordem de prioridade atual favorece:

1. Liquidez
2. Estrutura
3. Price Action
4. Tendência
5. Momentum
6. Volume
7. Volatilidade
8. Candles

## Redução de ruído

`shared/utils/patternFilters.ts` contém utilitários para:

- ordenar sinais por qualidade;
- limitar sinais contextuais por família;
- filtrar padrões elegíveis para sugestão;
- preservar sinais acionáveis e alertas.

## Próximos passos

1. Integrar `reducePatternList()` dentro de `Scanner.scan()` após deduplicação de BOS/CHOCH.
2. Usar `filterSuggestionEligiblePatterns()` em `SuggestionBuilder.build()` antes de escolher o padrão principal.
3. Exibir agrupamento por família no dashboard.
4. Medir win rate por família nos resultados históricos.
5. Ajustar confidence com base em performance histórica por família e por papel do sinal.
