# Scoring — graphAnalysis

Este documento descreve como o projeto calcula a sugestão operacional e a confiança exibida na UI.

O cálculo principal fica em `SuggestionBuilder`, dentro de `shared/utils/scanner.ts`.

---

## Objetivo

A confiança não deve ser uma caixa preta. Ela é composta por partes explícitas retornadas em `suggestion.scoreBreakdown`.

```ts
type SuggestionScoreBreakdown = {
  patternScore: number
  structureScore: number
  trendScore: number
  volumeScore: number
  confluenceBonus: number
  conflictPenalty: number
}
```

---

## Fórmula atual

```txt
confidence =
  patternScore
  + structureScore
  + trendScore
  + volumeScore
  + confluenceBonus
  - conflictPenalty
```

O resultado final é limitado por:

```ts
SCANNER.waitConfidence <= confidence <= SCANNER.maxConfidence
```

---

## `patternScore`

Média da confiança dos padrões selecionados para a direção dominante.

Exemplo:

```txt
Bullish patterns:
  Hammer: 68
  Bullish FVG: 70

patternScore = 69
```

---

## Direção dominante

O motor soma a confiança dos padrões bullish e bearish.

```txt
bullishScore > bearishScore -> buy
bearishScore > bullishScore -> sell
empate -> wait
```

Padrões neutros não definem direção diretamente.

---

## `structureScore`

Bônus quando há padrão estrutural na direção selecionada.

Prioridade atual:

1. BOS/CHOCH recebem `SCORING.structureBreakScore`.
2. HH/HL/LH/LL recebem `SCORING.marketStructureScore`.
3. Ausência de estrutura retorna `0`.

---

## `trendScore`

Calculado com a tendência do `ScanContext`.

```txt
tendência alinhada com a direção -> bônus
tendência contra a direção -> penalidade
neutro -> 0
```

A tendência vem de `getTrend()` usando EMA20 e EMA50.

---

## `volumeScore`

O volume é calculado com `relativeVolume()` e exposto via `ScanContext.currentRelativeVolume`.

O volume só afeta padrões que dependem mais de confirmação:

- BOS;
- CHOCH;
- FVG;
- Bullish Engulfing;
- Bearish Engulfing.

Regras atuais:

```txt
relativeVolume >= VOLUME.highRelativeVolume -> bônus
relativeVolume <= VOLUME.lowRelativeVolume -> penalidade
caso contrário -> 0
```

---

## `confluenceBonus`

Bônus por múltiplos padrões na mesma direção.

```txt
selectedPatterns.length - 1
  * SCANNER.confluenceBonusStep
```

Limitado por `SCANNER.maxConfluenceBonus`.

---

## `conflictPenalty`

Penalidade quando há sinais bullish e bearish ao mesmo tempo.

```txt
bullish.length > 0 && bearish.length > 0 -> SCORING.conflictPenalty
```

---

## Deduplicação BOS/CHOCH

CHOCH é tratado como especialização de BOS.

Quando ambos disparam na mesma direção, o BOS é removido para evitar dupla contagem.

```txt
Bullish BOS + Bullish CHOCH -> mantém Bullish CHOCH
Bearish BOS + Bearish CHOCH -> mantém Bearish CHOCH
```

---

## UI

A UI exibe o breakdown no `SuggestionCard.vue`.

As labels ficam em:

```txt
suggestion.scoreBreakdown.title
suggestion.scoreBreakdown.patternScore
suggestion.scoreBreakdown.structureScore
suggestion.scoreBreakdown.trendScore
suggestion.scoreBreakdown.volumeScore
suggestion.scoreBreakdown.confluenceBonus
suggestion.scoreBreakdown.conflictPenalty
```

---

## Próximas melhorias

1. Calibrar pesos com backtesting.
2. Separar score por categoria de padrão.
3. Ter pesos diferentes por timeframe.
4. Penalizar sinais contra timeframe maior.
5. Registrar score histórico por ativo.
