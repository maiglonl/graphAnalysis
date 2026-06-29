import { describe, expect, it } from 'vitest';
import { PatternIdEnum } from '#shared/types/market';
import {
  PatternFamilyEnum,
  PatternSignalRoleEnum,
  getPatternFamily,
  getPatternSignalRole,
} from '#shared/utils/patternFamilies';

describe('getPatternFamily', () => {
  it('classifies candle patterns', () => {
    expect(getPatternFamily(PatternIdEnum.Hammer)).toBe(PatternFamilyEnum.Candle);
    expect(getPatternFamily(PatternIdEnum.BullishEngulfing)).toBe(PatternFamilyEnum.Candle);
    expect(getPatternFamily(PatternIdEnum.Doji)).toBe(PatternFamilyEnum.Candle);
    expect(getPatternFamily(PatternIdEnum.BullishFvg)).toBe(PatternFamilyEnum.Candle);
    expect(getPatternFamily(PatternIdEnum.InsideBar)).toBe(PatternFamilyEnum.Candle);
  });

  it('classifies structure patterns', () => {
    expect(getPatternFamily(PatternIdEnum.BullishBos)).toBe(PatternFamilyEnum.Structure);
    expect(getPatternFamily(PatternIdEnum.BearishChoch)).toBe(PatternFamilyEnum.Structure);
    expect(getPatternFamily(PatternIdEnum.HigherHigh)).toBe(PatternFamilyEnum.Structure);
    expect(getPatternFamily(PatternIdEnum.LowerLow)).toBe(PatternFamilyEnum.Structure);
  });

  it('classifies price action patterns', () => {
    expect(getPatternFamily(PatternIdEnum.HeadAndShoulders)).toBe(PatternFamilyEnum.PriceAction);
    expect(getPatternFamily(PatternIdEnum.BullishFlag)).toBe(PatternFamilyEnum.PriceAction);
    expect(getPatternFamily(PatternIdEnum.AscendingTriangle)).toBe(PatternFamilyEnum.PriceAction);
    expect(getPatternFamily(PatternIdEnum.ChannelBreakout)).toBe(PatternFamilyEnum.PriceAction);
  });

  it('classifies volume patterns', () => {
    expect(getPatternFamily(PatternIdEnum.VolumeSpikeBullish)).toBe(PatternFamilyEnum.Volume);
    expect(getPatternFamily(PatternIdEnum.ClimaxVolumeTop)).toBe(PatternFamilyEnum.Volume);
    expect(getPatternFamily(PatternIdEnum.LowVolumePullbackBearish)).toBe(PatternFamilyEnum.Volume);
  });

  it('classifies volatility patterns', () => {
    expect(getPatternFamily(PatternIdEnum.AtrExpansionBreakout)).toBe(PatternFamilyEnum.Volatility);
    expect(getPatternFamily(PatternIdEnum.VolatilitySqueeze)).toBe(PatternFamilyEnum.Volatility);
    expect(getPatternFamily(PatternIdEnum.WideRangeCandle)).toBe(PatternFamilyEnum.Volatility);
  });

  it('classifies trend patterns', () => {
    expect(getPatternFamily(PatternIdEnum.GoldenCross)).toBe(PatternFamilyEnum.Trend);
    expect(getPatternFamily(PatternIdEnum.EmaBullishStack)).toBe(PatternFamilyEnum.Trend);
    expect(getPatternFamily(PatternIdEnum.RetestSupport)).toBe(PatternFamilyEnum.Trend);
  });

  it('classifies momentum patterns', () => {
    expect(getPatternFamily(PatternIdEnum.RsiBullishDivergence)).toBe(PatternFamilyEnum.Momentum);
    expect(getPatternFamily(PatternIdEnum.MacdBullishCross)).toBe(PatternFamilyEnum.Momentum);
    expect(getPatternFamily(PatternIdEnum.MomentumBreakout)).toBe(PatternFamilyEnum.Momentum);
    expect(getPatternFamily(PatternIdEnum.MomentumExhaustion)).toBe(PatternFamilyEnum.Momentum);
  });

  it('classifies liquidity patterns', () => {
    expect(getPatternFamily(PatternIdEnum.LiquiditySweepHigh)).toBe(PatternFamilyEnum.Liquidity);
    expect(getPatternFamily(PatternIdEnum.StopHuntLow)).toBe(PatternFamilyEnum.Liquidity);
    expect(getPatternFamily(PatternIdEnum.EqualHighs)).toBe(PatternFamilyEnum.Liquidity);
    expect(getPatternFamily(PatternIdEnum.OrderBlockBullish)).toBe(PatternFamilyEnum.Liquidity);
    expect(getPatternFamily(PatternIdEnum.BreakerBlockBearish)).toBe(PatternFamilyEnum.Liquidity);
  });

  it('covers all 116 PatternIdEnum entries', () => {
    const allIds = Object.values(PatternIdEnum);
    expect(allIds).toHaveLength(116);
    for (const id of allIds) {
      expect(getPatternFamily(id as PatternIdEnum)).toBeTruthy();
    }
  });
});

describe('getPatternSignalRole', () => {
  it('marks directional entry signals as actionable', () => {
    expect(getPatternSignalRole(PatternIdEnum.BullishEngulfing)).toBe(PatternSignalRoleEnum.Actionable);
    expect(getPatternSignalRole(PatternIdEnum.BullishBos)).toBe(PatternSignalRoleEnum.Actionable);
    expect(getPatternSignalRole(PatternIdEnum.GoldenCross)).toBe(PatternSignalRoleEnum.Actionable);
    expect(getPatternSignalRole(PatternIdEnum.OrderBlockBullish)).toBe(PatternSignalRoleEnum.Actionable);
    expect(getPatternSignalRole(PatternIdEnum.BreakerBlockBearish)).toBe(PatternSignalRoleEnum.Actionable);
  });

  it('marks indecision and context signals as context', () => {
    expect(getPatternSignalRole(PatternIdEnum.Doji)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.InsideBar)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.HigherHigh)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.EmaBullishStack)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.EqualHighs)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.AtrCompression)).toBe(PatternSignalRoleEnum.Context);
  });

  it('marks exhaustion and sweep signals as warning', () => {
    expect(getPatternSignalRole(PatternIdEnum.ExhaustionGapUp)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.ClimaxVolumeTop)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.VolatilitySqueeze)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.RsiBullishDivergence)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.MomentumExhaustion)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.LiquiditySweepHigh)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.StopHuntLow)).toBe(PatternSignalRoleEnum.Warning);
  });

  it('covers all 116 PatternIdEnum entries', () => {
    const allIds = Object.values(PatternIdEnum);
    for (const id of allIds) {
      expect(getPatternSignalRole(id as PatternIdEnum)).toBeTruthy();
    }
  });
});
