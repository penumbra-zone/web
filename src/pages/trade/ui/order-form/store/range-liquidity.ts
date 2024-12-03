import { makeAutoObservable } from 'mobx';
import { round } from '@penumbra-zone/types/round';

export enum UpperBoundOptions {
  Market = 'Market',
  Plus2Percent = '+2%',
  Plus5Percent = '+5%',
  Plus10Percent = '+10%',
  Plus15Percent = '+15%',
}

export enum LowerBoundOptions {
  Market = 'Market',
  Minus2Percent = '-2%',
  Minus5Percent = '-5%',
  Minus10Percent = '-10%',
  Minus15Percent = '-15%',
}

export enum FeeTierOptions {
  '0.1%' = '0.1%',
  '0.25%' = '0.25%',
  '0.5%' = '0.5%',
  '1.00%' = '1.00%',
}

const UpperBoundMultipliers = {
  [UpperBoundOptions.Market]: 1,
  [UpperBoundOptions.Plus2Percent]: 1.02,
  [UpperBoundOptions.Plus5Percent]: 1.05,
  [UpperBoundOptions.Plus10Percent]: 1.1,
  [UpperBoundOptions.Plus15Percent]: 1.15,
};

const LowerBoundMultipliers = {
  [LowerBoundOptions.Market]: 1,
  [LowerBoundOptions.Minus2Percent]: 0.98,
  [LowerBoundOptions.Minus5Percent]: 0.95,
  [LowerBoundOptions.Minus10Percent]: 0.9,
  [LowerBoundOptions.Minus15Percent]: 0.85,
};

const FeeTierValues: Record<FeeTierOptions, number> = {
  '0.1%': 0.1,
  '0.25%': 0.25,
  '0.5%': 0.5,
  '1.00%': 1,
};

export class RangeLiquidity {
  upperBound?: number;
  lowerBound?: number;
  feeTier?: number;
  positions?: number;
  marketPrice?: number;
  exponent?: number;
  onFieldChangeCallback?: () => Promise<void>;

  constructor() {
    makeAutoObservable(this);
  }

  setUpperBound = (amount: string) => {
    this.upperBound = Number(round({ value: Number(amount), decimals: this.exponent ?? 0 }));
  };

  setUpperBoundOption = (option: UpperBoundOptions) => {
    if (this.marketPrice) {
      this.upperBound = Number(
        round({
          value: this.marketPrice * UpperBoundMultipliers[option],
          decimals: this.exponent ?? 0,
        }),
      );
    }
  };

  setLowerBound = (amount: string) => {
    this.lowerBound = Number(round({ value: Number(amount), decimals: this.exponent ?? 0 }));
    if (this.onFieldChangeCallback) {
      void this.onFieldChangeCallback();
    }
  };

  setLowerBoundOption = (option: LowerBoundOptions) => {
    if (this.marketPrice) {
      this.lowerBound = Number(
        round({
          value: this.marketPrice * LowerBoundMultipliers[option],
          decimals: this.exponent ?? 0,
        }),
      );
    }
    if (this.onFieldChangeCallback) {
      void this.onFieldChangeCallback();
    }
  };

  setFeeTier = (feeTier: string) => {
    this.feeTier = Number(feeTier);
    if (this.onFieldChangeCallback) {
      void this.onFieldChangeCallback();
    }
  };

  setFeeTierOption = (option: FeeTierOptions) => {
    this.feeTier = FeeTierValues[option];
    if (this.onFieldChangeCallback) {
      void this.onFieldChangeCallback();
    }
  };

  setPositions = (positions: number | string) => {
    this.positions = Number(positions);
    if (this.onFieldChangeCallback) {
      void this.onFieldChangeCallback();
    }
  };

  setMarketPrice = (price: number) => {
    this.marketPrice = price;
  };

  setExponent = (exponent: number) => {
    this.exponent = exponent;
  };

  onFieldChange = (callback: () => Promise<void>): void => {
    this.onFieldChangeCallback = callback;
  };
}
