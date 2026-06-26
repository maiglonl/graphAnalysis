# Arquitetura — graphAnalysis

Aplicação Nuxt 4 de análise técnica de criptoativos. Detecta padrões de candle e estrutura de mercado, gera sugestões de operação e exibe gráfico interativo.

---

## Fluxo de Dados

```
Browser → GET /api/analyze?symbol=BTCUSDT&interval=1h
              │
              ▼
    server/api/analyze.get.ts
      │  busca candles via /api/candles
      │  Scanner.scan(candles)          → PatternSignal[]
      │  SuggestionBuilder.build(...)   → TradeSuggestion
      └─ retorna AnalyzeResponse
              │
              ▼
    app/pages/index.vue
      │  PriceChart.client.vue    ← renderiza gráfico + marcadores
      │  DetectedPatterns.vue     ← lista padrões detectados
      └─ SuggestionCard.vue       ← exibe sugestão de operação
```

---

## Camada de Detecção

### Hierarquia de Classes

```
PatternDetector                    shared/utils/detectors/PatternDetector.ts
  detect(ctx: ScanContext): PatternSignal[]

  ├── CandlePatternDetector        CandlePatternDetector.ts
  │     Template method: detect() chama match() e monta o sinal.
  │     Subclasses declaram id, direction, baseConfidence e implementam match().
  │
  │     ├── EngulfingDetector      candle/EngulfingDetector.ts
  │     │     Lógica de engolfo direcional. Subclasses declaram
  │     │     requiredTrend e prevIsBullish.
  │     │     ├── BullishEngulfingDetector
  │     │     └── BearishEngulfingDetector
  │     │
  │     ├── FvgDetector            candle/FvgDetector.ts
  │     │     Lógica de Fair Value Gap direcional. Subclasses implementam
  │     │     calcGap, isMiddleConfirming, calcEntry, calcStop, buildMeta.
  │     │     ├── BullishFvgDetector
  │     │     └── BearishFvgDetector
  │     │
  │     ├── HammerDetector
  │     ├── ShootingStarDetector
  │     ├── DojiDetector
  │     └── InsideBarDetector
  │
  ├── StructureBreakDetector       structure/StructureBreakDetector.ts
  │     Detecta rompimentos de swing high/low com buffer ATR.
  │     Subclasses declaram bullishId, bearishId, confidence.
  │     Podem sobrescrever allowsBullish/allowsBearish para pré-condições.
  │     ├── BosDetector            (sem pré-condição de trend)
  │     └── ChochDetector          (exige trend oposto)
  │
  └── MarketStructureDetector      structure/marketStructure.ts
        Mapeia pontos HH/HL/LH/LL para PatternSignal[].
```

### ScanContext

`ScanContext` (classe) é criado uma vez por requisição e pré-computa:
- `ema20`, `ema50` — para detecção de tendência
- `atr14` — para buffer de rompimento e dimensionamento de alvos

Expõe atalhos: `currentCandle`, `currentAtr`, `trend()`.

### Scanner e SuggestionBuilder

- **`Scanner`** recebe um array de detectores no construtor (injeção de dependência).
  Valida o input antes de processar.
- **`SuggestionBuilder`** agrega sinais, calcula score por direção e aplica bônus de confluência.

As funções `scanPatterns()` e `buildSuggestion()` são façades sobre as instâncias padrão,
mantidas para compatibilidade com o código existente do servidor.

---

## Tipagem Central (`shared/types/market.ts`)

| Tipo/Enum | Descrição |
|-----------|-----------|
| `PatternIdEnum` | ID único de cada padrão (camelCase) |
| `PatternDirectionEnum` | Bullish / Bearish / Neutral |
| `TradeActionEnum` | Buy / Sell / Wait / None |
| `IntervalEnum` | 15m / 1h / 4h / 1d |
| `StructureTrendEnum` | Tendência de mercado (compartilhado com `getTrend()`) |
| `MarketStructurePointEnum` | HH / HL / LH / LL |
| `PatternSignal` | Sinal de padrão (sem `name`/`reason` — derivados de i18n) |
| `TradeSuggestion` | Sugestão gerada pelo `SuggestionBuilder` |
| `AnalyzeResponse` | Resposta do endpoint `/api/analyze` |

---

## Internacionalização (i18n)

- Provedor: `@nuxtjs/i18n` v9 com `vue-i18n` v10
- Locales: `pt-BR` (padrão), `en-US`, `es-ES`
- Arquivos: `app/assets/locales/*.json`
- Estratégia: `no_prefix` — sem prefixo de locale na URL
- **Backend** retorna chaves i18n, não texto traduzido:
  - `disclaimer: "common.disclaimer"`
- **Componentes** derivam nome e razão do padrão:
  - `$t(\`patterns.${pattern.id}.name\`)`
  - `$t(\`patterns.${pattern.id}.reason\`)`

---

## Cores e Estilos

`shared/utils/colors.ts` é a única fonte de verdade para cores:
- `CHART_COLORS` — valores hex para `lightweight-charts`
- `ACTION_CLASSES` — classes Tailwind para badges de ação
- `directionColor(direction)` — cor hex por direção
- `actionColor(action)` — cor hex por ação

---

## Constantes de Detecção

`shared/utils/detectors/constants.ts` centraliza todos os valores de configuração.
Nenhum número literal deve aparecer em arquivos de detector.

```ts
CONFIDENCE.*        // confidence por padrão
ATR.*               // fatores ATR (tolerância, gap, stop)
THRESHOLDS.*        // thresholds de corpo e sombra
TARGET_MULTIPLIERS.*// multiplicadores de alvo
SCANNER.*           // minCandles, waitConfidence, maxConfidence, bonusStep
API.*               // candleLimit
```

---

## Decisões de Design

### PatternSignal sem name/reason
`name` e `reason` foram removidos de `PatternSignal` pois eram sempre
`"patterns.{id}.name"` e `"patterns.{id}.reason"` — redundância pura.
Os componentes derivam as chaves a partir do `id` em tempo de renderização.

### reasons: PatternIdEnum[]
`TradeSuggestion.reasons` é uma lista de IDs de padrão, não de strings i18n.
O componente resolve `$t(\`patterns.${id}.reason\`)` para cada item.

### Detectores stateless
Cada instância de detector não armazena estado entre chamadas.
O `Scanner` mantém as instâncias como singletons no array `detectors`.

### ScanContext como classe
Substituído de `type + factory function` para classe com getters (`currentCandle`, `currentAtr`, `trend()`),
tornando o acesso a dados derivados mais expressivo e seguro.
