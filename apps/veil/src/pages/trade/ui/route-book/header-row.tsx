import { Text } from '@penumbra-zone/ui/Text';

export interface OrderBookHeaderProps {
  base: string;
  quote: string;
}

export const RouteBookHeader = ({ base, quote }: OrderBookHeaderProps) => {
  return (
    <div className='col-span-4 grid grid-cols-subgrid border-b border-b-other-tonal-stroke px-4 text-xs text-text-secondary'>
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
