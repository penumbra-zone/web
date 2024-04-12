import { Button } from '@penumbra-zone/ui/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { Star } from 'lucide-react';
import { RESOLVED_TAILWIND_CONFIG } from '@penumbra-zone/tailwind-config/resolved-tailwind-config';

export const FrontendUrlButton = ({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) => {
  const { theme } = RESOLVED_TAILWIND_CONFIG;
  const label = isSelected ? 'Primary Penumbra frontend' : 'Set as primary Penumbra frontend';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className='h-[16px]'>
          <Button aria-label={label} className='h-auto bg-transparent' onClick={onClick}>
            <Star
              fill={isSelected ? theme.colors.muted.foreground : 'transparent'}
              className='text-muted-foreground'
              size={16}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='left'>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
