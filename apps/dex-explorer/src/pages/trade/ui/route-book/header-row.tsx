import { Text } from '@penumbra-zone/ui/Text';

export interface OrderBookHeaderProps {
  base: string;
  quote: string;
}

export const RouteBookHeader = ({ base, quote }: OrderBookHeaderProps) => {
  return (
    <div className='grid grid-cols-subgrid col-span-4 text-xs text-text-secondary px-4 border-b border-b-other-tonalStroke'>
      <div className='py-2 text-left'>
        <Text tableItemSmall>Price({quote})</Text>
      </div>
      <div className='py-2 text-right'>
        <Text tableItemSmall>Amount({base})</Text>
      </div>
      <div className='py-2 text-right'>
        <Text tableItemSmall>Total</Text>
      </div>
      <div className='py-2 text-right'>
        <Text tableItemSmall>Route</Text>
      </div>
    </div>
  );
};
