import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, TradeActionEnum, type Candle, type PatternSignal } from '#shared/types/market';
import { SuggestionBuilder } from '#shared/utils/scanner';

function makeCandles(volume = 100): Candle[] {
  return Array.from({ length: 50 }, (_, index) => ({
    time: index + 1,
    open: 100,
    high: 105,
    low: 95,
    close: 100,
    volume,
  }));
}

function makeBullishTrendCandles(): Candle[] {
  return Array.from({ length: 60 }, (_, index) => {
    const close = 100 + index;

    return {
      time: index + 1,
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 100,
    };
  });
}

function makeHighVolumeCandles(): Candle[] {
  const candles = makeCandles(100);
  candles[candles.length - 1] = { ...candles[candles.length - 1]!, volume: 1000 };
  return candles;
}

function makeLowVolumeCandles(): Candle[] {
  const candles = makeCandles(100);
  candles[candles.length - 1] = { ...candles[candles.length - 1]!, volume: 1 };
  return candles;
}

function pattern(overrides: Partial<PatternSignal>): PatternSignal {
  return {
    id: PatternIdEnum.Hammer,
    direction: PatternDirectionEnum.Bullish,
    confidence: 60,
    ...overrides,
  };
}

describe('SuggestionBuilder', () => {
  it('returns none without patterns', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), []);

    expect(suggestion.action).toBe(TradeActionEnum.None);
    expect(suggestion.confidence).toBe(0);
  });

  it('builds a bullish suggestion from bullish patterns', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.Hammer, confidence: 68, entry: 100, stop: 90, targets: [120] }),
    ]);

    expect(suggestion.action).toBe(TradeActionEnum.Buy);
    expect(suggestion.confidence).toBe(68);
    expect(suggestion.entry).toBe(100);
    expect(suggestion.reasons).toEqual([PatternIdEnum.Hammer]);
  });

  it('builds a bearish suggestion from bearish patterns', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.BearishEngulfing, direction: PatternDirectionEnum.Bearish, confidence: 74 }),
    ]);

    expect(suggestion.action).toBe(TradeActionEnum.Sell);
    expect(suggestion.confidence).toBe(74);
    expect(suggestion.reasons).toEqual([PatternIdEnum.BearishEngulfing]);
  });

  it('applies conflict penalty when both directions are present', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.Hammer, confidence: 60 }),
      pattern({ id: PatternIdEnum.BearishEngulfing, direction: PatternDirectionEnum.Bearish, confidence: 50 }),
    ]);

    expect(suggestion.action).toBe(TradeActionEnum.Buy);
    expect(suggestion.scoreBreakdown.conflictPenalty).toBe(10);
    expect(suggestion.confidence).toBe(50);
  });

  it('returns wait on tied directional scores', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.Hammer, confidence: 60 }),
      pattern({ id: PatternIdEnum.BearishEngulfing, direction: PatternDirectionEnum.Bearish, confidence: 60 }),
    ]);

    expect(suggestion.action).toBe(TradeActionEnum.Wait);
    expect(suggestion.confidence).toBe(45);
    expect(suggestion.scoreBreakdown.conflictPenalty).toBe(10);
  });

  it('adds high relative volume score for patterns that need confirmation', () => {
    const suggestion = new SuggestionBuilder().build(makeHighVolumeCandles(), [
      pattern({ id: PatternIdEnum.BullishFvg, confidence: 70 }),
    ]);

    expect(suggestion.scoreBreakdown.volumeScore).toBe(6);
    expect(suggestion.confidence).toBe(76);
  });

  it('subtracts low relative volume score for patterns that need confirmation', () => {
    const suggestion = new SuggestionBuilder().build(makeLowVolumeCandles(), [
      pattern({ id: PatternIdEnum.BullishFvg, confidence: 70 }),
    ]);

    expect(suggestion.scoreBreakdown.volumeScore).toBe(-4);
    expect(suggestion.confidence).toBe(66);
  });

  it('adds structure break score for BOS and CHOCH patterns', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.BullishBos, confidence: 76 }),
    ]);

    expect(suggestion.scoreBreakdown.structureScore).toBe(10);
    expect(suggestion.confidence).toBe(86);
  });

  it('adds market structure score for HH HL LH LL patterns', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ id: PatternIdEnum.HigherHigh, confidence: 58 }),
    ]);

    expect(suggestion.scoreBreakdown.structureScore).toBe(6);
    expect(suggestion.confidence).toBe(64);
  });

  it('adds trend score when suggestion direction follows the current trend', () => {
    const suggestion = new SuggestionBuilder().build(makeBullishTrendCandles(), [
      pattern({ id: PatternIdEnum.Hammer, confidence: 60 }),
    ]);

    expect(suggestion.scoreBreakdown.trendScore).toBe(8);
    expect(suggestion.confidence).toBe(68);
  });

  it('subtracts trend score when suggestion direction conflicts with the current trend', () => {
    const suggestion = new SuggestionBuilder().build(makeBullishTrendCandles(), [
      pattern({ id: PatternIdEnum.BearishEngulfing, direction: PatternDirectionEnum.Bearish, confidence: 60 }),
    ]);

    expect(suggestion.scoreBreakdown.trendScore).toBe(-8);
    expect(suggestion.confidence).toBe(52);
  });

  it('limits confluence bonus to configured maximum', () => {
    const suggestion = new SuggestionBuilder().build(makeCandles(), [
      pattern({ confidence: 50 }),
      pattern({ confidence: 50 }),
      pattern({ confidence: 50 }),
      pattern({ confidence: 50 }),
      pattern({ confidence: 50 }),
    ]);

    expect(suggestion.scoreBreakdown.confluenceBonus).toBe(15);
    expect(suggestion.confidence).toBe(65);
  });
});
