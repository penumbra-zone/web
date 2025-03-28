import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Text } from '@penumbra-zone/ui/Text';

export interface VoteProps {
  asset: Metadata;
  percent: number;
}

export const Vote = ({ asset, percent }: VoteProps) => {
  return (
    <div className='flex items-center gap-1'>
      <AssetIcon metadata={asset} />
      <Text smallTechnical color='text.primary'>
        {percent}% for
      </Text>
      <Text smallTechnical color='text.secondary'>
        {asset.symbol}
      </Text>
    </div>
  );
};
