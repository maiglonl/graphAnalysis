# Fixtures de Candles

Este documento registra os cenários reutilizáveis de candles usados nos testes.

## Arquivo base

```txt
tests/fixtures/candles/factories.ts
```

Factories disponíveis:

- `flatCandles()`;
- `narrowFlatCandles()`;
- `bullishTrendCandles()`;
- `bearishTrendCandles()`;
- `withLastCandle()`.

## Fixtures nomeadas

```txt
tests/fixtures/candles/hammer.ts
tests/fixtures/candles/bearishPinBar.ts
tests/fixtures/candles/doji.ts
tests/fixtures/candles/engulfing.ts
tests/fixtures/candles/insideBar.ts
tests/fixtures/candles/fvg.ts
```

## Convenção

1. Use factories para montar cenários simples.
2. Use fixtures nomeadas quando o cenário representar um padrão específico.
3. Evite candles reais em testes unitários.
4. Prefira valores pequenos, legíveis e com intenção clara.
