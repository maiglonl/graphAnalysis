# Roadmap Técnico — graphAnalysis

Este documento elenca as próximas etapas do projeto `graphAnalysis`, respeitando as decisões arquiteturais registradas no `CLAUDE.md` e as decisões refinadas durante a evolução do projeto.

O objetivo é servir como guia de execução para as próximas fases do scanner técnico: desde o fechamento do MVP visual até motor de análise avançado, watchlist, backtesting, persistência, alertas, testes e deploy.

---

## 1. Princípios do Projeto

O projeto deve evoluir seguindo estas regras:

- **Nuxt 4 + Vue 3 + TypeScript strict**.
- **Tailwind CSS v4** para estilização da UI.
- **`@nuxtjs/i18n`** para todos os textos exibidos ao usuário.
- **`lightweight-charts`** para gráficos de candles.
- **Backend via Nitro/server routes**.
- **Detectores orientados a objeto**.
- **Um arquivo por detector concreto**.
- **Enums obrigatórios** para padrões, direção, ação, timeframe e tendências estruturais.
- **Zero magic numbers em detectores**.
- **Textos de padrões derivados de i18n**.
- **Backend retornando chaves i18n, não textos traduzidos**.
- **`shared/utils/colors.ts` reservado apenas para semântica visual de mercado**.

---

## 2. Convenção Correta para `shared/utils/colors.ts`

O arquivo `shared/utils/colors.ts` deve centralizar apenas cores e classes relacionadas a **lógica de mercado**, **status operacional** ou **semântica financeira**.

### Pode conter

- Cores de direção:
  - bullish;
  - bearish;
  - neutral.
- Cores de plano de trade:
  - entry quando derivado de buy/sell;
  - stop;
  - target.
- Classes semânticas de ação:
  - buy;
  - sell;
  - wait;
  - none.
- Funções auxiliares:
  - `directionColor()`;
  - `actionColor()`.

### Não deve conter

- Classes de layout.
- Classes de formulário.
- Classes de card.
- Classes de texto genérico.
- Estilo de `LocaleSwitcher`.
- Background genérico do gráfico.
- Grid genérico do gráfico.
- Texto genérico do gráfico.
- Alerta genérico da UI.
- Qualquer estilo que não represente semântica de mercado.

### Exemplo esperado

```ts
export const MARKET_COLORS = {
  bullish: '#16a34a',
  bearish: '#dc2626',
  neutral: '#64748b',
  stop: '#ef4444',
  target: '#2563eb',
} as const
```

Estilizações comuns devem ficar no próprio componente Vue ou, futuramente, em arquivos genéricos de UI, caso o projeto decida criar essa camada.

---

# Fase 1 — Fechamento Arquitetural da Base

## Objetivo

Garantir que a base atual esteja coerente com o `CLAUDE.md` antes de adicionar novas funcionalidades.

## Tarefas

1. Revisar se `CLAUDE.md` reflete a versão real das dependências.
2. Atualizar a documentação para a versão correta do `@nuxtjs/i18n` usada no projeto.
3. Garantir `fallbackLocale: 'en-US'` no `nuxt.config.ts`.
4. Garantir que `server/api/candles.get.ts` use:
   - `IntervalEnum`;
   - `DEFAULT_SYMBOL`;
   - `DEFAULT_INTERVAL`;
   - `API.candleLimit`;
   - `API.minCandleLimit`;
   - `API.maxCandleLimit`.
5. Garantir que erros de API retornem chaves i18n:
   - `errors.invalidSymbol`;
   - `errors.invalidInterval`;
   - `errors.analyzeDefault`.
6. Garantir que `/api/analyze` retorne `symbol` e `interval` normalizados pelo endpoint `/api/candles`.
7. Garantir que `shared/utils/colors.ts` contenha apenas cores/status de mercado.
8. Garantir que `getActionClass()` receba `TradeActionEnum`, não `string` genérica.
9. Garantir que `BOS` e `CHOCH` não inflem artificialmente a sugestão quando representarem o mesmo rompimento.
10. Rodar:

```bash
npm run build
```

## Resultado esperado

Base coerente, tipada, com i18n consistente e pronta para crescimento.

---

# Fase 2 — Componentização da Interface

## Objetivo

Reduzir a responsabilidade de `app/pages/index.vue` e facilitar a evolução da interface.

## Componentes propostos

```txt
app/components/
  AnalysisForm.vue
  ChartPanel.vue
  SuggestionCard.vue
  DetectedPatterns.vue
  PriceChart.client.vue
  LocaleSwitcher.vue
```

## Responsabilidades

### `AnalysisForm.vue`

Responsável por:

- campo de símbolo;
- seletor de timeframe;
- botão de análise;
- estado de loading;
- emissão do evento `analyze`.

### `ChartPanel.vue`

Responsável por:

- cabeçalho do gráfico;
- símbolo atual;
- intervalo atual;
- preço atual;
- badge de ação sugerida;
- renderização do `PriceChart`.

### `SuggestionCard.vue`

Responsável por:

- confiança da sugestão;
- ação sugerida;
- entrada;
- stop;
- alvos;
- motivos da sugestão;
- disclaimer.

### `DetectedPatterns.vue`

Responsável por:

- listar todos os padrões detectados;
- exibir nome traduzido;
- exibir motivo traduzido;
- exibir confiança individual.

### `PriceChart.client.vue`

Responsável por:

- criar gráfico;
- renderizar candles;
- renderizar markers;
- renderizar linhas;
- reagir a resize/update.

A lógica de transformar padrões em anotações não deve ficar diretamente nesse componente.

## Regras

- Não usar texto literal em template.
- Usar `$t()` para qualquer texto exibido ao usuário.
- Não usar `<style scoped>`.
- Usar Tailwind diretamente nos componentes para layout comum.
- Importar `colors.ts` apenas para semântica de mercado.

## Resultado esperado

`index.vue` fica apenas como orquestrador da página.

---

# Fase 3 — Camada de Anotações do Gráfico

## Objetivo

Separar a lógica de anotações visuais da renderização do gráfico.

## Arquivo sugerido

```txt
app/utils/chartAnnotations.ts
```

## Responsabilidades

Transformar:

```ts
patterns: PatternSignal[]
suggestion: TradeSuggestion
candles: Candle[]
```

em:

```ts
ChartPatternMarker[]
ChartPriceLine[]
ChartZone[]
```

## Deve suportar

1. Markers para padrões detectados.
2. Linha de entrada.
3. Linha de stop.
4. Linhas de alvos.
5. Linha de nível rompido em BOS/CHOCH.
6. Linhas de início/fim de FVG.
7. Posteriormente, zonas retangulares para FVG.

## Tipos sugeridos

```ts
export enum ChartPriceLineKindEnum {
  Entry = 'entry',
  Stop = 'stop',
  Target = 'target',
  FvgBoundary = 'fvgBoundary',
  BrokenLevel = 'brokenLevel',
}

export type ChartPatternMarker = {
  id: string
  time: number
  direction: PatternDirectionEnum
  patternId: PatternIdEnum
}

export type ChartPriceLine = {
  id: string
  price: number
  kind: ChartPriceLineKindEnum
  titleKey: string
  titleParams?: Record<string, unknown>
  direction?: PatternDirectionEnum
}
```

## Resultado esperado

`PriceChart.client.vue` passa a apenas renderizar dados visuais já preparados.

---

# Fase 4 — Linhas de Entrada, Stop, Alvos, FVG e BOS/CHOCH

## Objetivo

Tornar a sugestão operacional visível no gráfico.

## Implementar

1. Linha de entrada.
2. Linha de stop.
3. Linha de alvo 1.
4. Linha de alvo 2.
5. Linha de início do FVG.
6. Linha de fim do FVG.
7. Linha do nível rompido em BOS/CHOCH.

## Regras visuais

- Entrada usa cor derivada de `actionColor()`.
- Stop usa `MARKET_COLORS.stop`.
- Alvos usam `MARKET_COLORS.target`.
- FVG usa cor derivada de `directionColor()`.
- BOS/CHOCH usa cor derivada de `directionColor()`.
- Background, grid e texto do gráfico ficam no componente ou numa futura camada genérica de chart UI, não em `colors.ts`.

## Locales necessários

Adicionar em todos os locales:

```json
"chart": {
  "targetLine": "Target {n}",
  "fvgStart": "FVG start",
  "fvgEnd": "FVG end",
  "brokenLevel": "Broken level"
}
```

Traduzir adequadamente em `pt-BR`, `en-US` e `es-ES`.

## Resultado esperado

O usuário visualiza diretamente no gráfico o plano operacional e os níveis técnicos principais.

---

# Fase 5 — Zonas Visuais de FVG

## Objetivo

Evoluir de linhas horizontais de FVG para zonas visuais.

## Tipo sugerido

```ts
export enum ChartZoneKindEnum {
  FairValueGap = 'fairValueGap',
}

export type ChartZone = {
  id: string
  fromTime: number
  toTime: number
  top: number
  bottom: number
  direction: PatternDirectionEnum
  kind: ChartZoneKindEnum
}
```

## Dados necessários

Os detectores de FVG já devem retornar no `meta`:

```ts
{
  gapStart: number
  gapEnd: number
  gapSize: number
}
```

## Estratégias possíveis

O `lightweight-charts` não oferece retângulos simples como API principal em todos os fluxos. As opções são:

1. Primitive/custom series.
2. Overlay HTML sincronizado com escala de tempo/preço.
3. Representação inicial com duas linhas horizontais e labels.

## Recomendação

Começar com linhas e labels. Depois evoluir para overlay/primitive.

## Resultado esperado

FVGs ficam visualmente claros no gráfico, permitindo identificar zonas de ineficiência.

---

# Fase 6 — Swing High / Swing Low no Gráfico

## Objetivo

Mostrar os pontos estruturais que o scanner está usando para interpretar o mercado.

## Implementar

1. Expor swings no resultado da análise.
2. Adicionar markers para:
   - Swing High;
   - Swing Low;
   - Higher High;
   - Higher Low;
   - Lower High;
   - Lower Low.
3. Usar i18n para labels.
4. Usar cores conforme direção:
   - bullish;
   - bearish;
   - neutral.

## Possível ajuste no backend

Adicionar ao `AnalyzeResponse`:

```ts
structure?: {
  lastHigh: SwingPoint | null
  previousHigh: SwingPoint | null
  lastLow: SwingPoint | null
  previousLow: SwingPoint | null
  points: MarketStructurePointEnum[]
  trend: StructureTrendEnum
}
```

## Resultado esperado

O usuário passa a entender visualmente por que o scanner classificou a estrutura como altista, baixista ou neutra.

---

# Fase 7 — Labels Visuais para BOS e CHOCH

## Objetivo

Tornar rompimentos estruturais mais explícitos.

## Implementar

1. Marker no candle do rompimento.
2. Linha horizontal no nível rompido.
3. Label traduzido:
   - Bullish BOS;
   - Bearish BOS;
   - Bullish CHOCH;
   - Bearish CHOCH.

## Regra importante

Se houver CHOCH e BOS no mesmo candle/direção, priorizar CHOCH para evitar dupla contagem.

## Resultado esperado

O gráfico comunica claramente que ocorreu quebra ou mudança de estrutura.

---

# Fase 8 — Melhorar o Modelo de Sugestão

## Objetivo

Tornar a sugestão menos dependente do padrão individual mais forte.

## Situação atual

O `SuggestionBuilder` calcula direção e confiança usando padrões bullish/bearish e confluência simples.

## Novo modelo sugerido

```txt
Score final =
  score de padrões
  + score de estrutura
  + score de tendência
  + score de volume
  + score de confluência
  - penalidades por conflito
```

## Tipo sugerido

```ts
export type SuggestionScoreBreakdown = {
  patternScore: number
  structureScore: number
  trendScore: number
  volumeScore: number
  confluenceBonus: number
  conflictPenalty: number
}
```

Adicionar em `TradeSuggestion`:

```ts
scoreBreakdown?: SuggestionScoreBreakdown
```

## Possíveis regras

- BOS alinhado com tendência aumenta score.
- CHOCH contra tendência maior reduz agressividade.
- FVG + BOS aumenta confluência.
- Engolfo + volume aumenta score.
- Sinais bullish e bearish no mesmo candle aplicam penalidade.
- Padrões neutros reduzem agressividade se não houver confirmação.

## Resultado esperado

A sugestão fica mais explicável, auditável e profissional.

---

# Fase 9 — Volume e Confirmação

## Objetivo

Usar volume como fator de confirmação.

## Implementar

1. Usar `relativeVolume()` de forma efetiva.
2. Adicionar no `ScanContext`:

```ts
readonly relativeVolume20: number[]
```

3. Criar getter:

```ts
get currentRelativeVolume(): number
```

4. Criar constantes:

```ts
export const VOLUME = {
  highRelativeVolume: 1.5,
  lowRelativeVolume: 0.7,
} as const
```

## Usos possíveis

- BOS com volume alto aumenta confiança.
- CHOCH sem volume reduz confiança.
- Engolfo com volume alto aumenta confiança.
- FVG com volume relevante aumenta confiança.
- Breakout sem volume recebe penalidade.

## Resultado esperado

Sinais confirmados por volume ficam mais fortes que sinais isolados.

---

# Fase 10 — Novos Detectores de Candle

## Objetivo

Expandir a cobertura do scanner mantendo a arquitetura OO.

## Padrões recomendados

1. Morning Star.
2. Evening Star.
3. Piercing Line.
4. Dark Cloud Cover.
5. Tweezer Top.
6. Tweezer Bottom.
7. Marubozu.
8. Spinning Top.
9. Three White Soldiers.
10. Three Black Crows.

## Fluxo obrigatório para cada padrão

1. Adicionar em `PatternIdEnum`.
2. Adicionar confidence em `CONFIDENCE`.
3. Criar detector em arquivo próprio.
4. Registrar no `defaultScanner`.
5. Adicionar chaves nos 3 locales:
   - `pt-BR.json`;
   - `en-US.json`;
   - `es-ES.json`.
6. Adicionar testes unitários.
7. Atualizar documentação se o padrão introduzir nova convenção.

## Resultado esperado

Scanner cobre mais padrões de candle sem perder organização.

---

# Fase 11 — Novos Detectores de Estrutura

## Objetivo

Aumentar a qualidade da leitura de price action.

## Detectores recomendados

1. Liquidity Sweep.
2. Equal Highs.
3. Equal Lows.
4. Order Block.
5. Breaker Block.
6. Mitigation Block.
7. Premium/Discount Zone.
8. Range High/Range Low.
9. Trendline Break.
10. Support/Resistance Retest.

## Prioridade sugerida

1. Liquidity Sweep.
2. Equal Highs / Equal Lows.
3. Order Block.
4. Retest de BOS.
5. Premium/Discount.

## Regras

- Seguir arquitetura OO.
- Um arquivo por detector concreto.
- Textos em locale.
- Confidence em constants.
- Sem magic numbers.

## Resultado esperado

O scanner passa a interpretar estrutura de mercado de forma mais robusta.

---

# Fase 12 — Multi-Timeframe Analysis

## Objetivo

Evitar sugestões contra a tendência de timeframes maiores.

## Exemplo

Se o usuário analisa:

```txt
BTCUSDT 15m
```

O sistema pode consultar também:

```txt
1h
4h
```

## Tipo sugerido

```ts
export type MultiTimeframeContext = {
  current: AnalyzeResponse
  higherTimeframes: {
    interval: IntervalEnum
    trend: StructureTrendEnum
    action: TradeActionEnum
    confidence: number
  }[]
}
```

## Regras possíveis

- Compra no 15m com 4h bullish aumenta confiança.
- Compra no 15m com 4h bearish reduz confiança.
- Venda no 15m com 4h bearish aumenta confiança.
- Venda no 15m com 4h bullish reduz confiança.
- CHOCH contra tendência maior vira `wait` ou reduz confiança.
- BOS alinhado com timeframe maior recebe bônus.

## Resultado esperado

As sugestões passam a considerar contexto maior, reduzindo sinais ruins contra tendência principal.

---

# Fase 13 — Watchlist e Scan em Lote

## Objetivo

Transformar o scanner em um painel de oportunidades.

## Implementar

1. Lista de ativos monitorados.
2. Scan em lote.
3. Ranking por confiança.
4. Filtro por ação:
   - buy;
   - sell;
   - wait;
   - none.
5. Filtro por padrão:
   - BOS;
   - CHOCH;
   - FVG;
   - Engulfing;
   - etc.

## Endpoint sugerido

```txt
/api/scan
```

## Query sugerida

```txt
symbols=BTCUSDT,ETHUSDT,SOLUSDT&interval=1h
```

## Retorno sugerido

```ts
export type ScanListResponse = {
  interval: IntervalEnum
  items: AnalyzeResponse[]
}
```

## Resultado esperado

O usuário consegue encontrar oportunidades sem analisar ativo por ativo manualmente.

---

# Fase 14 — Cache de Candles

## Objetivo

Reduzir chamadas repetidas à Binance e melhorar performance.

## Estratégia inicial

Cache em memória no servidor.

## Chave sugerida

```ts
type CandleCacheKey = `${string}:${IntervalEnum}:${number}`
```

Representando:

```txt
symbol:interval:limit
```

## TTL sugerido por timeframe

```txt
15m -> 30s a 60s
1h  -> 2min a 5min
4h  -> 5min a 15min
1d  -> 30min a 60min
```

## Arquivo sugerido

```txt
server/utils/candleCache.ts
```

## Resultado esperado

Menos chamadas externas e resposta mais rápida.

---

# Fase 15 — Abstração de Data Providers

## Objetivo

Evitar acoplamento direto com Binance.

## Interface sugerida

```ts
export type GetCandlesParams = {
  symbol: string
  interval: IntervalEnum
  limit: number
}

export interface MarketDataProvider {
  getCandles(params: GetCandlesParams): Promise<Candle[]>
}
```

## Providers futuros

1. Binance.
2. Coinbase.
3. Twelve Data.
4. Polygon.
5. Alpha Vantage.
6. Yahoo Finance.
7. B3 via provedor pago.

## Estrutura sugerida

```txt
server/utils/marketData/
  MarketDataProvider.ts
  BinanceProvider.ts
  index.ts
```

## Resultado esperado

Trocar ou adicionar fontes de dados fica simples.

---

# Fase 16 — Gestão de Erros de Provedor

## Objetivo

Tratar erros externos de forma previsível e traduzível.

## Casos a tratar

1. Símbolo inexistente.
2. Timeframe inválido.
3. Rate limit.
4. Timeout.
5. Resposta vazia.
6. API fora do ar.
7. Dados incompletos.

## Tipo sugerido

```ts
export enum MarketDataErrorCodeEnum {
  InvalidSymbol = 'invalidSymbol',
  InvalidInterval = 'invalidInterval',
  RateLimited = 'rateLimited',
  Timeout = 'timeout',
  EmptyResponse = 'emptyResponse',
  ProviderUnavailable = 'providerUnavailable',
}
```

## Resultado esperado

O usuário recebe mensagens claras e o sistema fica mais robusto contra falhas externas.

---

# Fase 17 — Testes Unitários

## Objetivo

Garantir que detectores e utilitários não quebrem durante refatorações.

## Ferramenta sugerida

Vitest.

## Scripts sugeridos

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch"
}
```

## Testes prioritários

1. `candleParts`.
2. `calculateTargets`.
3. `ema`.
4. `atr`.
5. `getTrend`.
6. `isSwingHigh`.
7. `isSwingLow`.
8. `HammerDetector`.
9. `ShootingStarDetector`.
10. `EngulfingDetector`.
11. `FvgDetector`.
12. `MarketStructureDetector`.
13. `BosDetector`.
14. `ChochDetector`.
15. `SuggestionBuilder`.

## Estrutura sugerida

```txt
tests/
  fixtures/
  utils/
    indicators.test.ts
    scanner.test.ts
    detectors/
      candle/
      structure/
```

## Resultado esperado

Confiança para evoluir o motor sem quebrar comportamento existente.

---

# Fase 18 — Fixtures de Candles

## Objetivo

Criar cenários controlados para testes.

## Estrutura sugerida

```txt
tests/fixtures/candles/
  bullishTrend.ts
  bearishTrend.ts
  hammer.ts
  shootingStar.ts
  bullishEngulfing.ts
  bearishEngulfing.ts
  bullishFvg.ts
  bearishFvg.ts
  bullishBos.ts
  bearishBos.ts
  bullishChoch.ts
  bearishChoch.ts
```

## Regras

- Fixtures devem ser pequenas e legíveis.
- Cada fixture deve deixar claro o cenário esperado.
- Evitar depender de candles reais em testes unitários.
- Candles reais podem ser usados em testes de integração/backtest.

## Resultado esperado

Cada detector pode ser validado com dados previsíveis.

---

# Fase 19 — Backtesting Simples

## Objetivo

Avaliar historicamente se os sinais teriam bom desempenho.

## MVP de backtest

Para cada candle histórico:

1. executar scanner até aquele candle;
2. se houver sugestão, simular entrada;
3. verificar candles seguintes;
4. identificar se bateu stop ou alvo;
5. registrar resultado;
6. agregar métricas.

## Métricas

```txt
Win rate
Loss rate
Risk/reward médio
Retorno médio
Drawdown
Número de operações
Confiança média
Padrões mais lucrativos
Padrões mais problemáticos
```

## Endpoint sugerido

```txt
/api/backtest
```

## Tipo sugerido

```ts
export type BacktestTrade = {
  entryTime: number
  exitTime: number | null
  action: TradeActionEnum
  entry: number
  stop: number
  target: number
  result: 'win' | 'loss' | 'open' | 'expired'
  patterns: PatternIdEnum[]
  confidence: number
}

export type BacktestResult = {
  symbol: string
  interval: IntervalEnum
  trades: BacktestTrade[]
  metrics: {
    totalTrades: number
    wins: number
    losses: number
    winRate: number
    averageRiskReward: number
    averageReturn: number
    maxDrawdown: number
  }
}
```

## Resultado esperado

O projeto deixa de apenas sugerir e passa a medir a qualidade histórica dos sinais.

---

# Fase 20 — Score por Resultado Histórico

## Objetivo

Usar backtests para calibrar os pesos do scanner.

## Possíveis análises

1. Quais padrões performam melhor por timeframe.
2. Quais padrões performam melhor em tendência bullish.
3. Quais padrões performam melhor em tendência bearish.
4. Quais padrões falham mais em lateralização.
5. Qual confiança mínima produz melhor relação risco/retorno.

## Resultado esperado

O scanner passa a ter ajustes baseados em dados, não apenas heurística manual.

---

# Fase 21 — Persistência

## Objetivo

Guardar análises, watchlists, backtests e preferências.

## Banco sugerido

PostgreSQL via Supabase.

## Tabelas futuras

```txt
users
watchlists
watchlist_symbols
analysis_snapshots
backtest_runs
backtest_trades
settings
alerts
```

## Resultado esperado

O usuário consegue acompanhar histórico e personalizar o scanner.

---

# Fase 22 — UI de Dashboard

## Objetivo

Transformar a tela inicial em painel de análise.

## Componentes futuros

```txt
WatchlistPanel
MarketOverview
OpportunityRanking
PatternFilter
TimeframeSelector
AnalysisDetailsDrawer
BacktestSummary
RiskPlanCard
AlertsPanel
```

## Layout sugerido

```txt
Topo:
  símbolo, timeframe, idioma, status da análise

Coluna esquerda:
  watchlist, filtros e ranking

Centro:
  gráfico + anotações

Coluna direita:
  plano de operação + padrões + risco

Abaixo:
  histórico de sinais e resumo de backtest
```

## Resultado esperado

O projeto deixa de ser uma única tela de análise e passa a parecer uma ferramenta real de mercado.

---

# Fase 23 — Gestão de Risco

## Objetivo

Permitir que o usuário calcule tamanho de posição.

## Inputs

```txt
Capital total
Risco por operação (%)
Preço de entrada
Stop
```

## Outputs

```txt
Valor arriscado
Distância até stop
Tamanho da posição
Quantidade aproximada
Risco/retorno por alvo
```

## Tipo sugerido

```ts
export type RiskPlan = {
  accountSize: number
  riskPercent: number
  riskAmount: number
  entry: number
  stop: number
  positionSize: number
  quantity: number
  riskRewardByTarget: number[]
}
```

## Resultado esperado

A sugestão operacional passa a incluir controle de risco, não apenas direção.

---

# Fase 24 — Alertas

## Objetivo

Alertar quando uma condição relevante aparecer.

## Tipos de alerta

1. Novo BOS.
2. Novo CHOCH.
3. Novo FVG.
4. Novo Liquidity Sweep.
5. Preço chegou na entrada.
6. Preço chegou no alvo.
7. Preço chegou no stop.
8. Confiança acima de X%.
9. Alinhamento multi-timeframe.
10. Novo ativo no ranking de oportunidades.

## Inicialmente

- Alertas visuais na tela.
- Lista de eventos recentes.

## Futuramente

- Web push.
- Telegram.
- Discord.
- Email.

## Resultado esperado

O usuário não precisa ficar atualizando manualmente a tela para encontrar oportunidades.

---

# Fase 25 — Jobs e Monitoramento

## Objetivo

Permitir varreduras periódicas de mercado.

## Implementar futuramente

1. Job para scan de watchlist.
2. Job para atualizar candles.
3. Job para avaliar alertas.
4. Job para persistir snapshots.

## Opções técnicas

- Cron via plataforma de deploy.
- Nitro scheduled tasks se disponível no ambiente.
- Worker separado.
- Supabase Edge Functions.

## Resultado esperado

O scanner passa de ferramenta reativa para ferramenta de monitoramento.

---

# Fase 26 — Qualidade e CI

## Objetivo

Evitar regressões em cada mudança.

## Scripts recomendados

```json
{
  "typecheck": "vue-tsc --noEmit",
  "test": "vitest",
  "build": "nuxt build"
}
```

Adicionar lint se o projeto decidir padronizar ESLint:

```json
{
  "lint": "eslint ."
}
```

## Pipeline sugerido no GitHub Actions

```txt
install
typecheck
test
build
```

## Resultado esperado

Cada push valida automaticamente a saúde do projeto.

---

# Fase 27 — Documentação Técnica

## Objetivo

Manter o projeto fácil de evoluir.

## Documentos recomendados

```txt
CLAUDE.md
docs/roadmap.md
docs/architecture.md
docs/detectors.md
docs/scoring.md
docs/chart-annotations.md
docs/api.md
docs/backtesting.md
docs/providers.md
docs/testing.md
```

## Conteúdo importante

- Como criar detector.
- Como adicionar padrão.
- Como adicionar locale.
- Como funciona score.
- Como funciona backtest.
- Como funciona provider de dados.
- Como funciona chart annotation.
- Como funciona gestão de risco.
- Como funciona watchlist.

## Resultado esperado

Qualquer nova etapa pode ser implementada seguindo convenções claras.

---

# Fase 28 — Deploy

## Objetivo

Publicar o MVP.

## Opções

1. Vercel.
2. Netlify.
3. Render.
4. VPS própria.

## Atenção

Como o projeto usa server routes para consultar dados externos, o deploy precisa suportar Nuxt/Nitro server-side.

## Checklist

```txt
Build funcionando
Server routes funcionando
Variáveis de ambiente configuradas
Cache habilitado
Limites da API respeitados
Logs mínimos
Tratamento de erro externo
Fallback de i18n
```

## Resultado esperado

MVP acessível publicamente.

---

# Fase 29 — Segurança e Limites

## Objetivo

Evitar abuso dos endpoints e uso incorreto da API externa.

## Implementar

1. Sanitização de símbolo.
2. Validação de intervalos.
3. Limite de candles.
4. Rate limit por IP.
5. Cache obrigatório em scan em lote.
6. Timeout em providers externos.
7. Tratamento de erro previsível.

## Resultado esperado

A aplicação fica mais resistente a uso incorreto e falhas externas.

---

# Fase 30 — Internacionalização Completa

## Objetivo

Garantir que a aplicação esteja 100% traduzível.

## Verificar

1. Nenhum texto literal em template.
2. Nenhum texto literal em retorno de backend.
3. Todos os padrões possuem:
   - `name`;
   - `reason`.
4. Todos os erros possuem chave i18n.
5. Todos os títulos de gráfico possuem chave i18n.
6. Todas as ações possuem chave i18n.
7. Todas as telas futuras seguem o mesmo padrão.

## Resultado esperado

O projeto permanece pronto para `pt-BR`, `en-US` e `es-ES`.

---

# Ordem Recomendada de Execução

## Fase A — Fechamento do MVP visual

1. Finalizar saneamento arquitetural.
2. Componentizar UI.
3. Criar `app/utils/chartAnnotations.ts`.
4. Adicionar linhas de entrada, stop e alvos.
5. Adicionar linhas de FVG.
6. Adicionar linha de BOS/CHOCH.
7. Adicionar markers de swings.
8. Evoluir FVG para zonas visuais.

## Fase B — Motor de análise melhor

9. Deduplicar BOS/CHOCH.
10. Adicionar score breakdown.
11. Adicionar volume.
12. Melhorar confiança.
13. Adicionar novos detectores de estrutura.
14. Adicionar novos padrões de candle.
15. Adicionar multi-timeframe analysis.

## Fase C — Produto real

16. Watchlist.
17. Scan em lote.
18. Cache.
19. Providers.
20. Gestão de risco.
21. Alertas.
22. Jobs de monitoramento.

## Fase D — Validação

23. Testes unitários.
24. Fixtures.
25. Backtesting.
26. Métricas históricas.
27. CI.

## Fase E — Persistência e deploy

28. Banco de dados.
29. Histórico.
30. Preferências.
31. Deploy.
32. Documentação final.

---

# Próxima Tarefa Imediata

A próxima tarefa prática recomendada é:

```txt
Criar app/utils/chartAnnotations.ts e ajustar PriceChart.client.vue para renderizar anotações vindas dessa camada.
```

Em seguida:

```txt
Evoluir FVG de linhas horizontais para zonas visuais.
```

---

# Critério de Qualidade Para Novas Etapas

Toda nova etapa deve responder:

1. Está aderente ao `CLAUDE.md`?
2. Usa enums quando necessário?
3. Evita magic numbers?
4. Usa i18n para texto?
5. Mantém `colors.ts` apenas para semântica de mercado?
6. Mantém detectores em arquivos separados?
7. Tem caminho claro para testes?
8. Não mistura regra de negócio com UI?

Se alguma resposta for "não", a etapa deve ser ajustada antes de ser considerada concluída.
