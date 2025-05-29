import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Text } from '@penumbra-zone/ui/Text';
import { round } from '@penumbra-zone/types/round';

export interface VoteProps {
  asset: Metadata;
  percent: number;
  hideFor?: boolean;
}

export const Vote = ({ asset, percent, hideFor }: VoteProps) => {
  return (
    <div className='flex items-center gap-1'>
      <AssetIcon metadata={asset} />
      <Text smallTechnical color='text.primary'>
        {round({ value: percent * 100, decimals: 2 })}% {hideFor ? '' : 'for'}
      </Text>
      <Text smallTechnical color='text.secondary'>
        {asset.symbol}
      </Text>
    </div>
  );
};
