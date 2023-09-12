import { CaretDownIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/components';

export const NetworksPopover = () => {
  return (
    <Popover open={false}>
      <PopoverTrigger>
        <div className='flex items-center justify-between gap-4 py-2 px-3 rounded-lg border border-border bg-background'>
          <p className='text-base_semiBold text-muted-foreground font-headline'>penumbra-testnet</p>
          <CaretDownIcon className='h-5 w-5 hover:opacity-50' />
        </div>
      </PopoverTrigger>
      <PopoverContent></PopoverContent>
    </Popover>
  );
};
