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
  server/
    candleCache.test.ts
    historicalSimulation.test.ts
    marketDataProviderError.test.ts
  utils/
    apiErrors.test.ts
    chartAnnotations.test.ts
    indicators.test.ts
    riskPlan.test.ts
    scanner/
      scanner.test.ts
      suggestionBuilder.test.ts
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

### Erros de API

Arquivo:

```txt
tests/utils/apiErrors.test.ts
```

Cobre:

- tradução de erro vindo de `data.message`;
- tradução de erro vindo de `message`;
- fallback para erro desconhecido;
- fallback para valores não objeto.

### Anotações de gráfico

Arquivo:

```txt
tests/utils/chartAnnotations.test.ts
```

Cobre:

- criação de markers de padrão;
- filtro de rompimentos estruturais nos markers genéricos;
- deduplicação visual BOS/CHOCH;
- linhas de plano de trade;
- linhas de FVG e rompimento;
- deduplicação de price lines;
- zonas FVG.

### Scanner

Arquivo:

```txt
tests/utils/scanner/scanner.test.ts
```

Cobre:

- input com candles insuficientes;
- input com candles inválidos;
- retorno de sinais dos detectores;
- deduplicação de Bullish BOS quando Bullish CHOCH está presente;
- deduplicação de Bearish BOS quando Bearish CHOCH está presente.

### Sugestão

Arquivo:

```txt
tests/utils/scanner/suggestionBuilder.test.ts
```

Cobre:

- retorno neutro sem padrões;
- sugestão bullish;
- sugestão bearish;
- penalidade por conflito;
- empate direcional com `wait`;
- bônus por volume relativo alto;
- penalidade por volume relativo baixo;
- bônus por quebra de estrutura;
- bônus por estrutura de mercado.

### Cache de candles

Arquivo:

```txt
tests/server/candleCache.test.ts
```

Cobre:

- geração de chave de cache;
- leitura antes da expiração;
- expiração por TTL do timeframe;
- limpeza explícita do cache.

### Simulação histórica

Arquivo:

```txt
tests/server/historicalSimulation.test.ts
```

Cobre:

- trade comprado vencedor;
- trade vendido perdedor;
- trade expirado;
- ignorar sugestões sem ação operacional.

### Erro de provider de mercado

Arquivo:

```txt
tests/server/marketDataProviderError.test.ts
```

Cobre:

- código de erro;
- status HTTP;
- default status;
- type guard `isMarketDataProviderError()`.

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
- CHOCH.

### Scanner e sugestão

- `Scanner.scan()` com confluência;
- `SuggestionBuilder` com tendência alinhada/contrária;
- `SuggestionBuilder` com confluência máxima.

### UI utils

- markers de estrutura de mercado.

### API/server utils

- `BinanceProvider` com mock;
- `analyzeMarket` com candles mockados;
- endpoints Nuxt com mocks de provider.

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
