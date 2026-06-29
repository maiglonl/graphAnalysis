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
  fixtures/
    candles/
      bearishPinBar.ts
      doji.ts
      engulfing.ts
      factories.ts
      fvg.ts
      hammer.ts
      insideBar.ts
      shootingStar.ts
  server/
    analyzeMarket.test.ts
    binanceProvider.test.ts
    candleCache.test.ts
    candleQuery.test.ts
    historicalSimulation.test.ts
    historicalTimeframeSummary.test.ts
    marketDataProviderError.test.ts
    scanQuery.test.ts
    timeframeSummaryQuery.test.ts
  utils/
    apiErrors.test.ts
    chartAnnotations.test.ts
    indicators.test.ts
    riskPlan.test.ts
    rankingSummary.test.ts
    patternFamilies.test.ts
    patternSignalQuality.test.ts
    patternNoiseReduction.test.ts
    patternFamilyStats.test.ts
    signalQualityCalibration.test.ts
    scoreCalibration.test.ts
    calibratedSuggestion.test.ts
    scanner/
      scanner.test.ts
      suggestionBuilder.test.ts
    detectors/
      helpers.test.ts
      candle/
        dojiDetector.test.ts
        engulfingDetector.test.ts
        fvgDetector.test.ts
        hammerDetector.test.ts
        insideBarDetector.test.ts
        shootingStarDetector.test.ts
        continuationDetectors.test.ts   (updated: added On Neck / In Neck / Thrusting)
        reversalTwoCandleDetectors.test.ts
      structure/
        structureDetectors.test.ts
      priceAction/
        swingReversalDetectors.test.ts
        headAndShouldersDetectors.test.ts
        continuationBreakoutDetectors.test.ts
        rangeDetectors.test.ts
        triangleDetectors.test.ts
        wedgeAndChannelDetectors.test.ts
      liquidity/
        liquiditySweepDetectors.test.ts
        equalLevelsDetectors.test.ts
        orderBlockDetectors.test.ts
        breakerBlockDetectors.test.ts
```

---

## Fixtures de candles

Arquivo base:

```txt
tests/fixtures/candles/factories.ts
```

Fornece factories para:

- candles laterais;
- candles laterais com range estreito;
- tendência bullish;
- tendência bearish;
- composição de cenário com último candle customizado.

Fixtures nomeadas já disponíveis:

```txt
tests/fixtures/candles/bearishPinBar.ts
tests/fixtures/candles/doji.ts
tests/fixtures/candles/engulfing.ts
tests/fixtures/candles/fvg.ts
tests/fixtures/candles/hammer.ts
tests/fixtures/candles/insideBar.ts
tests/fixtures/candles/shootingStar.ts
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
- `relativeVolume()`;
- `rsi()`;
- `macd()`;
- `stochastic()`.

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
- markers de estrutura de mercado;
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
- confluência entre múltiplos detectores;
- deduplicação de Bullish BOS quando Bullish CHOCH está presente;
- deduplicação de Bearish BOS quando Bearish CHOCH está presente.

### Ranking de padrões

Arquivo:

```txt
tests/app/utils/rankingSummary.test.ts
```

Cobre:

- empty list handling;
- buy/sell/wait counts;
- actionable count (buy+sell only);
- best symbol by confidence;
- null best for non-actionable items only.

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
- bônus por estrutura de mercado;
- bônus por tendência alinhada;
- penalidade por tendência contrária;
- limite máximo de confluência.

### Análise de mercado

Arquivo:

```txt
tests/server/analyzeMarket.test.ts
```

Cobre:

- chamada a `/api/candles`;
- integração com `scanPatterns()`;
- integração com `buildSuggestion()`;
- retorno de preço e timestamp atuais;
- fallback para `price` e `updatedAt` nulos sem candles.

### Queries de API

Arquivos:

```txt
tests/server/candleQuery.test.ts
tests/server/scanQuery.test.ts
tests/server/timeframeSummaryQuery.test.ts
```

Cobre:

- defaults de query vazia;
- sanitização de símbolo;
- normalização de intervalo;
- clamp de limite;
- limite de símbolos por scan;
- filtro e limite de timeframes;
- erro de símbolo inválido;
- erro de intervalo inválido.

### Provider Binance

Arquivo:

```txt
tests/server/binanceProvider.test.ts
```

Cobre:

- chamada ao endpoint público de klines;
- normalização de klines para `Candle[]`;
- erro de resposta vazia;
- erro de símbolo inválido;
- erro de timeout;
- erro de rate limit.

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
- ignorar sugestões sem ação operacional;
- taxa de perda;
- retorno médio;
- drawdown máximo;
- confiança média;
- estatísticas agrupadas por padrão.

### Simulação histórica multi-timeframe

Arquivo:

```txt
tests/server/historicalTimeframeSummary.test.ts
```

Cobre:

- carregamento de candles por timeframe;
- execução de simulação histórica para cada timeframe solicitado;
- retorno ordenado por lista de timeframes solicitada.

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

### Detectores de candle

Arquivos:

```txt
tests/utils/detectors/candle/dojiDetector.test.ts
tests/utils/detectors/candle/engulfingDetector.test.ts
tests/utils/detectors/candle/fvgDetector.test.ts
tests/utils/detectors/candle/hammerDetector.test.ts
tests/utils/detectors/candle/insideBarDetector.test.ts
tests/utils/detectors/candle/shootingStarDetector.test.ts
tests/utils/detectors/candle/continuationDetectors.test.ts
tests/utils/detectors/candle/reversalTwoCandleDetectors.test.ts
```

Cobre:

- Hammer;
- Doji;
- Shooting Star;
- Bullish Engulfing;
- Bearish Engulfing;
- Inside Bar;
- Bullish FVG;
- Bearish FVG;
- On Neck;
- In Neck;
- Thrusting;
- Piercing Line;
- Dark Cloud Cover.

### Range/Rectangle detectors

Arquivo: `tests/utils/detectors/priceAction/rangeDetectors.test.ts`

Cobre: RectangleBreakoutUp, RectangleBreakoutDown, RangeRejectionHigh, RangeRejectionLow.

### Triangle detectors

Arquivo: `tests/utils/detectors/priceAction/triangleDetectors.test.ts`

Cobre: AscendingTriangle, DescendingTriangle, SymmetricalTriangle (bullish e bearish breakout).

### Wedge and Channel Breakout detectors

Arquivo: `tests/utils/detectors/priceAction/wedgeAndChannelDetectors.test.ts`

Cobre: RisingWedge, FallingWedge, ChannelBreakout (bullish e bearish).

### Detectores de volume

Arquivo: `tests/utils/detectors/volume/volumeDetectors.test.ts`

Cobre: Volume Spike Bullish, Volume Spike Bearish, Climax Volume Top, Climax Volume Bottom, Low Volume Pullback Bullish, Low Volume Pullback Bearish.

### Detectores de volatilidade

Arquivo: `tests/utils/detectors/volatility/volatilityDetectors.test.ts`

Cobre: ATR Expansion Breakout, ATR Compression, Volatility Squeeze, Wide Range Candle.

### Detectores de tendência e médias móveis

Arquivos:

```txt
tests/utils/detectors/trend/movingAverageDetectors.test.ts
tests/utils/detectors/trend/trendlineRetestDetectors.test.ts
```

Cobre: Golden Cross, Death Cross, EMA Bullish Stack, EMA Bearish Stack, MA Pullback Bullish, MA Pullback Bearish, Trendline Break Up, Trendline Break Down, Retest Support, Retest Resistance.

### Detectores de momentum e divergências

Arquivos:

```txt
tests/utils/detectors/momentum/macdAndStochasticDetectors.test.ts
tests/utils/detectors/momentum/divergenceDetectors.test.ts
tests/utils/detectors/momentum/momentumBreakoutDetectors.test.ts
```

Cobre: MACD Bullish Cross, MACD Bearish Cross, Stochastic Oversold Reversal, Stochastic Overbought Reversal, RSI Bullish Divergence, RSI Bearish Divergence, MACD Bullish Divergence, MACD Bearish Divergence, Momentum Breakout (bullish e bearish), Momentum Exhaustion (bullish e bearish).

### Detectores de liquidez e ordem

Arquivos:

```txt
tests/utils/detectors/liquidity/liquiditySweepDetectors.test.ts
tests/utils/detectors/liquidity/equalLevelsDetectors.test.ts
tests/utils/detectors/liquidity/orderBlockDetectors.test.ts
tests/utils/detectors/liquidity/breakerBlockDetectors.test.ts
```

Cobre: Liquidity Sweep High, Liquidity Sweep Low, Equal Highs, Equal Lows, Order Block Bullish, Order Block Bearish, Breaker Block Bullish, Breaker Block Bearish.

### Calibração de score

Arquivos:

```txt
tests/utils/signalQualityCalibration.test.ts
tests/utils/scoreCalibration.test.ts
tests/utils/calibratedSuggestion.test.ts
```

Cobre:
- `buildSignalQualityCalibration()`: ajuste por família e por papel do sinal;
- `getSignalQualityScoreAdjustment()`: combina família+papel com clamp;
- `buildScoreCalibration()`: ajuste individual por padrão + signalQualityAdjustments;
- `getPatternScoreAdjustment()`: soma padrão + família + papel com clamp total;
- `getSuggestionScoreAdjustment()`: soma por reason + família (1×) + papel (1×) com clamp total;
- `applyScoreCalibration()`: aplica calibração em `TradeSuggestion`, não ajusta Wait.

### Qualidade e famílias de padrões

Arquivos:

```txt
tests/utils/patternFamilies.test.ts
tests/utils/patternSignalQuality.test.ts
tests/utils/patternNoiseReduction.test.ts
tests/utils/patternFamilyStats.test.ts
```

Cobre:
- `getPatternFamily()` para os 8 grupos (candle, structure, priceAction, volume, volatility, trend, momentum, liquidity);
- `getPatternSignalRole()` para roles actionable, context e warning; cobertura dos 116 PatternIdEnum entries;
- `sortPatternsBySignalQuality()`, `getPrimaryActionablePattern()`, `groupPatternsByFamily()`;
- `reducePatternNoise()`: mantém acionáveis/alertas, limita contextuais por família;
- `filterSuggestionEligiblePatterns()`, `hasActionableSignal()`;
- `aggregatePatternStatsByFamily()`: agrega HistoricalPatternStat[] por família.

### Detectores de estrutura

Arquivo:

```txt
tests/utils/detectors/structure/structureDetectors.test.ts
```

Cobre:

- Market Structure;
- Bullish BOS;
- Bearish BOS;
- Bullish CHOCH;
- filtro de CHOCH fora da tendência oposta.

---

## Próximos testes recomendados

### API/server utils

- endpoints Nuxt com mocks de provider.

---

## Convenções

1. Preferir fixtures pequenas e legíveis.
2. Não depender de API externa em teste unitário.
3. Não testar implementação interna quando o comportamento público for suficiente.
4. Testar um detector por arquivo.
5. Usar `PatternIdEnum`, `TradeActionEnum` e demais enums nos asserts.

---

## Critério mínimo para novas features

Toda feature nova deve incluir pelo menos uma destas opções:

1. Teste unitário;
2. Teste de utilitário;
3. Fixture documentada;
4. Documentação técnica explicando como testar manualmente.
