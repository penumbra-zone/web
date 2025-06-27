import sample from 'lodash/sample';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { useRegistry } from '@/shared/api/registry';

export interface DisplayLP {
  date: string;
  liquidityShape: string;
  status: string;
  minPrice: ValueView;
  maxPrice: ValueView;
  currentValue: ValueView;
  volume: ValueView;
  feesEarned: ValueView;
  pnl: string;
}

export const getDisplayLPs = ({
  usdcMetadata,
  // positionBundles,
}: {
  usdcMetadata: Metadata;
  // positionBundles: LpPositionBundleResponse[];
}): DisplayLP[] => {
  const displayLPs = [];

  const exponent = usdcMetadata.denomUnits.find(x => x.denom === usdcMetadata.display)?.exponent;
  const statuses = ['In range', 'Out of range', 'Closed'];

  for (let i = 0; i < 10; i++) {
    displayLPs.push({
      date: '06-20 09:12:43',
      liquidityShape: i % 2 === 0 ? 'Locally Stable' : 'Volatile',
      status: sample(statuses),
      minPrice: pnum(0.45, exponent).toValueView(usdcMetadata),
      maxPrice: pnum(0.55, exponent).toValueView(usdcMetadata),
      currentValue: pnum(220.0, exponent).toValueView(usdcMetadata),
      volume: pnum(2000.0, exponent).toValueView(usdcMetadata),
      feesEarned: pnum(20.0, exponent).toValueView(usdcMetadata),
      pnl: '+8.65%',
    });
  }

  return displayLPs;
};
