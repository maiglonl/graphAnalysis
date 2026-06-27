# Testing — graphAnalysis

Este documento descreve a estrutura de testes do projeto.

---

## Scripts disponíveis

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "typecheck": "vue-tsc --noEmit"
}
```

---

## Rodando localmente

```bash
npm run typecheck
npm run test
npm run build
```

Para modo watch:

```bash
npm run test:watch
```

---

## Configuração

Arquivo:

```txt
vitest.config.ts
```

Aliases configurados:

```txt
#shared -> ./shared
~       -> ./app
```

Ambiente:

```txt
node
```

---

## Estrutura atual

```txt
tests/
  utils/
    indicators.test.ts
    riskPlan.test.ts
    detectors/
      helpers.test.ts
      candle/
        hammerDetector.test.ts
```

---

## O que já está coberto

### Indicadores

Arquivo:

```txt
tests/utils/indicators.test.ts
```

Cobre:

- `sma()`;
- `ema()`;
- `atr()`;
- `relativeVolume()`.

### Helpers de detectores

Arquivo:

```txt
tests/utils/detectors/helpers.test.ts
```

Cobre:

- `round()`;
- `candleParts()`;
- `calculateTargets()`.

### Gestão de risco

Arquivo:

```txt
tests/utils/riskPlan.test.ts
```

Cobre:

- cálculo de risco;
- quantidade;
- tamanho de posição;
- risco/retorno por alvo;
- retorno `null` sem entrada e stop válidos.

### Detector Hammer

Arquivo:

```txt
tests/utils/detectors/candle/hammerDetector.test.ts
```

Cobre:

- detecção de Hammer após tendência baixista.

---

## Próximos testes recomendados

### Detectores de candle

- Shooting Star;
- Doji;
- Bullish Engulfing;
- Bearish Engulfing;
- Inside Bar;
- Bullish FVG;
- Bearish FVG.

### Detectores de estrutura

- Market Structure;
- BOS;
- CHOCH;
- deduplicação BOS/CHOCH.

### Scanner

- `Scanner.scan()` com input inválido;
- `Scanner.scan()` com confluência;
- `SuggestionBuilder` com direção bullish;
- `SuggestionBuilder` com direção bearish;
- `SuggestionBuilder` com conflito;
- `SuggestionBuilder` com volume alto/baixo.

### API/server utils

- `candleCache`;
- `BinanceProvider` com mock;
- `MarketDataProviderError`;
- `analyzeMarket` com candles mockados.

---

## Convenções

1. Preferir fixtures pequenas e legíveis.
2. Não depender de API externa em teste unitário.
3. Não testar implementação interna quando o comportamento público for suficiente.
4. Testar um detector por arquivo.
5. Usar `PatternIdEnum`, `TradeActionEnum` e demais enums nos asserts.

---

## Fixtures recomendadas

```txt
tests/fixtures/candles/
  bullishTrend.ts
  bearishTrend.ts
  hammer.ts
  bullishEngulfing.ts
  bearishEngulfing.ts
  bullishFvg.ts
  bearishFvg.ts
  bullishBos.ts
  bearishBos.ts
  bullishChoch.ts
  bearishChoch.ts
```

---

## Critério mínimo para novas features

Toda feature nova deve incluir pelo menos uma destas opções:

1. Teste unitário;
2. Teste de utilitário;
3. Fixture documentada;
4. Documentação técnica explicando como testar manualmente.
