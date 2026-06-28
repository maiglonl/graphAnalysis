# Catálogo de Padrões

Objetivo de longo prazo: cobrir aproximadamente 90 a 110 padrões técnicos entre candles, price action, estrutura, volatilidade, volume e gaps.

## Status atual

### Implementados e ativos no scanner

```txt
Hammer
Inverted Hammer
Hanging Man
Shooting Star
Doji
Long-Legged Doji
Dragonfly Doji
Gravestone Doji
Spinning Top
Bullish Marubozu
Bearish Marubozu
Bullish Kicker
Bearish Kicker
Three White Soldiers
Three Black Crows
Rising Three Methods
Falling Three Methods
Mat Hold
Bullish Separating Lines
Bearish Separating Lines
Upside Tasuki Gap
Downside Tasuki Gap
On Neck
In Neck
Thrusting
Bullish Breakaway Gap
Bearish Breakaway Gap
Runaway Gap Up
Runaway Gap Down
Exhaustion Gap Up
Exhaustion Gap Down
Gap Fill Bullish
Gap Fill Bearish
Island Reversal Bottom
Island Reversal Top
Bullish Engulfing
Bearish Engulfing
Bullish Harami
Bearish Harami
Piercing Line
Dark Cloud Cover
Morning Star
Evening Star
Tweezer Bottom
Tweezer Top
Inside Bar
Bullish FVG
Bearish FVG
Bullish BOS
Bearish BOS
Bullish CHOCH
Bearish CHOCH
Higher High
Higher Low
Lower High
Lower Low
Double Top
Double Bottom
Triple Top
Triple Bottom
```

Total ativo aproximado: 60 padrões/sinais.

## Próximos lotes sugeridos

### Lote 5 — Estrutura e price action

```txt
Head and Shoulders
Inverse Head and Shoulders
Bullish Flag
Bearish Flag
Bullish Pennant
Bearish Pennant
```

### Lote 5 — Canais, triângulos e ranges

```txt
Ascending Triangle
Descending Triangle
Symmetrical Triangle
Rising Wedge
Falling Wedge
Rectangle Breakout Up
Rectangle Breakout Down
Range Rejection High
Range Rejection Low
Channel Breakout
```

### Lote 6 — Volume e volatilidade

```txt
Volume Spike Bullish
Volume Spike Bearish
Climax Volume Top
Climax Volume Bottom
Low Volume Pullback Bullish
Low Volume Pullback Bearish
ATR Expansion Breakout
ATR Compression
Volatility Squeeze
Wide Range Candle
```

### Lote 7 — Médias e tendência

```txt
Golden Cross
Death Cross
EMA Bullish Stack
EMA Bearish Stack
MA Pullback Bullish
MA Pullback Bearish
Trendline Break Up
Trendline Break Down
Retest Support
Retest Resistance
```

### Lote 8 — Momentum e divergências

```txt
RSI Bullish Divergence
RSI Bearish Divergence
MACD Bullish Cross
MACD Bearish Cross
MACD Bullish Divergence
MACD Bearish Divergence
Stochastic Oversold Reversal
Stochastic Overbought Reversal
Momentum Breakout
Momentum Exhaustion
```

### Lote 9 — Ordem e liquidez

```txt
Liquidity Sweep High
Liquidity Sweep Low
Stop Hunt High
Stop Hunt Low
Equal Highs
Equal Lows
Order Block Bullish
Order Block Bearish
Breaker Block Bullish
Breaker Block Bearish
```

## Estratégia de implementação

1. Adicionar enum em `PatternIdEnum`.
2. Adicionar constantes de confiança e thresholds.
3. Criar um detector concreto por arquivo.
4. Registrar no `defaultScanner` ou em registry importado pelo scanner.
5. Adicionar traduções em `pt-BR`, `en-US` e `es-ES`.
6. Adicionar fixture ou teste unitário mínimo.
7. Atualizar este catálogo.

## Observação

A expansão deve ser feita por lotes pequenos para manter typecheck, testes e calibração sob controle. O scanner já possui score, backtesting e calibração histórica, então cada novo padrão passa a participar automaticamente das métricas de performance histórica.
