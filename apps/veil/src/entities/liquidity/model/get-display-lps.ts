import sample from 'lodash/sample';
import { ValueView, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';

export interface DisplayLP {
  date: string;
  directedPair: string;
  liquidityShape: string;
  status: string;
  minPrice: ValueView;
  maxPrice: ValueView;
  currentValue: ValueView;
  volume: ValueView;
  feesEarned: ValueView;
  pnlPercentage: number;
}

export const getDisplayLPs = ({ usdcMetadata }: { usdcMetadata: Metadata }): DisplayLP[] => {
  const displayLPs = [];
  const exponent = usdcMetadata.denomUnits.find(x => x.denom === usdcMetadata.display)?.exponent;
  const statuses = ['In range', 'Out of range', 'Closed'];

  for (let i = 0; i < 10; i++) {
    displayLPs.push({
      date: '06-20 09:12:43',
      directedPair: i % 2 === 0 ? 'BTC/USDC' : 'UM/USDC',
      liquidityShape: i % 2 === 0 ? 'Locally Stable' : 'Volatile',
      status: sample(statuses) ?? 'Closed',
      minPrice: pnum(0.45, exponent).toValueView(usdcMetadata),
      maxPrice: pnum(0.55, exponent).toValueView(usdcMetadata),
      currentValue: pnum(220.0, exponent).toValueView(usdcMetadata),
      volume: pnum(2000.0, exponent).toValueView(usdcMetadata),
      feesEarned: pnum(20.0, exponent).toValueView(usdcMetadata),
      pnlPercentage: i % 3 === 0 ? 8.65 : -1.23,
    });
  }

  return displayLPs;
};
