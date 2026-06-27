# Testes de Estado e Calibração

Este complemento registra testes adicionados após a base principal de testes.

## Watchlist

Arquivo:

```txt
tests/utils/watchlist.test.ts
```

Cobre:

- normalização de símbolo;
- adição sem duplicidade;
- ignorar símbolo vazio;
- limite máximo de itens;
- remoção de símbolo.

## Histórico de simulações

Arquivo:

```txt
tests/utils/simulationHistory.test.ts
```

Cobre:

- criação de snapshot compacto;
- adição sem duplicidade;
- limite máximo de snapshots.

## Calibração de score

Arquivos:

```txt
tests/utils/scoreCalibration.test.ts
tests/utils/calibratedSuggestion.test.ts
tests/server/historicalScoreCalibration.test.ts
tests/server/analyzeMarketWithCalibration.test.ts
```

Cobre:

- ajuste positivo por padrão;
- ajuste negativo por padrão;
- amostra baixa sem ajuste;
- limite de ajuste por padrão;
- aplicação opcional da calibração em sugestão operacional;
- preservação de sugestões `wait`;
- endpoint/utilitário de calibração histórica;
- análise calibrada experimental.
