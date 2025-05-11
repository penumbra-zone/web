import cn from 'clsx';
import { Fragment, useState } from 'react';
import { CircleEllipsis } from 'lucide-react';
import { AddressViewComponent } from '../AddressView';
import { useDensity } from '../utils/density';
import { Popover } from '../Popover';
import { Button } from '../Button';
import { SummaryBalance } from './balance';
import { Density } from '../Density';
import { SummaryEffect } from './adapt-effects';

export interface SummaryEffectsProps {
  effects: SummaryEffect[];
}

export const SummaryEffects = ({ effects }: SummaryEffectsProps) => {
  const density = useDensity();
  const compact = density !== 'sparse';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex flex-wrap items-center gap-1'>
      {effects.map((effect, index) => (
        <Fragment key={index}>
          <div
            className={cn('flex items-center gap-1', compact && 'max-w-[150px] overflow-hidden')}
          >
            {effect.balances.map((balance, index) => (
              <SummaryBalance key={index} balance={balance} />
            ))}
          </div>

          {compact && (
            <Density slim>
              <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <Popover.Trigger>
                  <Button
                    type='button'
                    iconOnly='adornment'
                    icon={CircleEllipsis}
                    onClick={() => setIsOpen(true)}
                  >
                    Show more
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <div className='flex flex-col gap-1'>
                    {effect.balances.map((balance, index) => (
                      <SummaryBalance key={index} balance={balance} />
                    ))}
                  </div>
                </Popover.Content>
              </Popover>
            </Density>
          )}

          <Density slim>
            <AddressViewComponent truncate hideIcon addressView={effect.address} />
          </Density>
        </Fragment>
      ))}
    </div>
  );
};
