# graphAnalysis — Guia para Agentes e Desenvolvedores

Este arquivo é lido automaticamente por agentes Claude Code no início de cada sessão.
Siga estas convenções rigorosamente. Se uma mudança exigir violar algum padrão, atualize esta documentação primeiro.

---

## Tecnologias

- **Nuxt 4** + **Vue 3** + **TypeScript** (strict)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **`@nuxtjs/i18n` v10** (lazy loading, browser detection, fallback en-US)
- **`lightweight-charts`** para o gráfico de candles

---

## Estrutura de Pastas

```
shared/
  types/market.ts          — todos os tipos e enums da aplicação
  utils/
    detectors/
      constants.ts         — ÚNICA fonte de magic numbers (confidence, ATR, thresholds)
      helpers.ts           — round(), candleParts(), calculateTargets()
      PatternDetector.ts   — classe base abstrata
      CandlePatternDetector.ts — base para padrões de candle (template method)
      candle/
        EngulfingDetector.ts — base direcional para engulfings
        FvgDetector.ts       — base direcional para FVGs
        *.ts                 — um arquivo por detector concreto
      structure/
        StructureBreakDetector.ts — base para BOS/CHOCH
        *.ts                      — um arquivo por detector concreto
    scanner.ts             — classes Scanner e SuggestionBuilder + funções de compatibilidade
    scanContext.ts         — classe ScanContext (pré-computa EMA/ATR)
    indicators.ts          — funções de indicadores (ema, atr, getTrend, isSwing*)
    marketStructure.ts     — getMarketStructure, getSwingHighs, getSwingLows
    colors.ts              — CHART_COLORS, ACTION_CLASSES, directionColor, actionColor
server/api/
  analyze.get.ts           — endpoint principal
app/
  assets/locales/          — pt-BR.json, en-US.json, es-ES.json
  components/              — componentes Vue (Tailwind apenas, sem CSS inline)
  composables/             — useTradeAction.ts
  pages/index.vue
```

---

## Regras Obrigatórias

### 1. Zero magic numbers
Todos os valores numéricos de detecção vivem em `shared/utils/detectors/constants.ts`:
- `CONFIDENCE.*` — confidence por padrão
- `ATR.*` — fatores de ATR
- `THRESHOLDS.*` — thresholds de body/shadow
- `TARGET_MULTIPLIERS.*` — multiplicadores de alvo
- `SCANNER.*` — configurações do scanner
- `API.*` — configurações da API

**Nunca** escreva `68`, `0.05`, `* 2` diretamente em detectores.

### 2. Zero strings literais em componentes
Todos os textos passam por `$t('chave.i18n')`. Locales em `app/assets/locales/`.
O backend retorna chaves i18n, não texto traduzido.

### 3. Zero comparações com strings/números mapeados em enum
Use `PatternIdEnum`, `PatternDirectionEnum`, `TradeActionEnum`, `IntervalEnum`, `StructureTrendEnum`.
Nunca compare `action === 'buy'` — use `action === TradeActionEnum.Buy`.

### 4. Hierarquia OO obrigatória para detectores
```
PatternDetector (abstrato)
  └── CandlePatternDetector (abstrato, template method)
        ├── EngulfingDetector (abstrato, par direcional)
        │     ├── BullishEngulfingDetector
        │     └── BearishEngulfingDetector
        ├── FvgDetector (abstrato, par direcional)
        │     ├── BullishFvgDetector
        │     └── BearishFvgDetector
        └── [outros detectores de candle]
  └── StructureBreakDetector (abstrato)
        ├── BosDetector
        └── ChochDetector
  └── MarketStructureDetector
```

### 5. Um arquivo por classe de detector
Cada detector concreto tem seu próprio arquivo. Não agrupe detectores em um arquivo.
Arquivos base (`EngulfingDetector.ts`, `FvgDetector.ts`, `StructureBreakDetector.ts`) ficam na pasta da categoria.

### 6. Cores centralizadas
Cores hex (para `lightweight-charts`) → `CHART_COLORS` em `shared/utils/colors.ts`.
Classes Tailwind (para UI) → `ACTION_CLASSES` em `shared/utils/colors.ts`.
Nunca escreva `#16a34a` ou `bg-green-100` em componente ou detector.

### 7. Tailwind v4 sem valores interpolados
Use classes padrão do Tailwind (`min-h-96`, `flex`, `gap-3`).
Nunca use sintaxe interpolada como `min-h-[420px]`.

---

## Como Adicionar um Novo Padrão de Candle

1. **`shared/types/market.ts`** — adicionar `NovoPadrao = 'novoPadrao'` em `PatternIdEnum`
2. **`shared/utils/detectors/constants.ts`** — adicionar `novoPadrao: XX` em `CONFIDENCE`
3. **`shared/utils/detectors/candle/novoPadrao.ts`** — criar classe estendendo `CandlePatternDetector` (ou base direcional se for par)
4. **`shared/utils/scanner.ts`** — instanciar e adicionar ao array do `defaultScanner`
5. **Locales** — adicionar `"novoPadrao": { "name": "...", "reason": "..." }` em `patterns` nos 3 arquivos de locale
6. **Componentes** derivam nome/razão automaticamente via `$t(\`patterns.${pattern.id}.name\`)`

## Como Adicionar um Novo Detector de Estrutura

1. Estender `StructureBreakDetector` (se for rompimento direcional) ou `PatternDetector` diretamente
2. Seguir os mesmos passos 1, 2, 4, 5 acima

---

## Padrões a Evitar

| Errado | Correto |
|--------|---------|
| `confidence: 76` | `confidence: CONFIDENCE.bos` |
| `* 0.05` | `* ATR.breakoutTolerance` |
| `targets: [entry + risk * 2, entry + risk * 3]` | `calculateTargets(entry, risk, 'up')` |
| `id: 'bullish_bos'` | `id: PatternIdEnum.BullishBos` |
| `name: 'Bullish BOS'` em PatternSignal | removido — derivado de `$t(\`patterns.${id}.name\`)` |
| `reason: 'Texto...'` em PatternSignal | removido — derivado de `$t(\`patterns.${id}.reason\`)` |
| `label: 'Comprar'` em TradeSuggestion | removido — derivado de `$t(\`actions.${action}\`)` |
| CSS inline ou `<style scoped>` | Tailwind utility classes |
| Texto puro em template Vue | `$t('chave')` |

---

## Atualização desta Documentação

Ao adicionar um novo padrão OO, novo enum, nova convenção ou nova pasta:
1. Atualize a seção relevante neste arquivo
2. Atualize `docs/architecture.md` se a mudança for arquitetural
3. Faça commit de ambos junto com o código da mudança
