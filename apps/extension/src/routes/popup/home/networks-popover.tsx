import { CaretDownIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/components';

export const NetworksPopover = () => {
  return (
    <Popover open={false}>
      <PopoverTrigger>
        <div className='flex items-center justify-between gap-4 rounded-lg border bg-background px-[18px] py-2'>
          <p className='font-bold text-muted-foreground'>penumbra-testnet</p>
          <CaretDownIcon className='h-5 w-5 hover:opacity-50' />
        </div>
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
};
