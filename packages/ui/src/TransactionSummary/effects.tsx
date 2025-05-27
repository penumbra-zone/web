import { useState } from 'react';
import { CircleEllipsis } from 'lucide-react';
import { AddressViewComponent } from '../AddressView';
import { Popover } from '../Popover';
import { Button } from '../Button';
import { SummaryBalance } from './balance';
import { Density } from '../Density';
import { SummaryEffect } from './adapt-effects';

export interface SummaryEffectsProps {
  effects: SummaryEffect[];
}

const MAX_VISIBLE_EFFECTS = 2; // Show max 2 rows before showing ellipsis

export const SummaryEffects = ({ effects }: SummaryEffectsProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const visibleEffects = effects.slice(0, MAX_VISIBLE_EFFECTS);
  const hiddenEffects = effects.slice(MAX_VISIBLE_EFFECTS);
  const hasHiddenEffects = hiddenEffects.length > 0;

  return (
    <div className='flex flex-col'>
      {/* Visible effect rows */}
      {visibleEffects.map((effect, index) => {
        console.log('DEBUG: Rendering effect address:', effect.address);
        return (
          <div key={index} className='flex items-center gap-2'>
            {/* Balance changes for this account */}
            <div className='flex items-center gap-1'>
              {effect.balances.map((balance, balanceIndex) => (
                <SummaryBalance key={balanceIndex} balance={balance} />
              ))}
            </div>

            {/* Account address */}
            {effect.address && (
              <Density slim>
                <div className='max-w-32'>
                  <AddressViewComponent truncate hideIcon addressView={effect.address} />
                </div>
              </Density>
            )}
          </div>
        );
      })}

      {/* Show ellipsis button if there are hidden effects */}
      {hasHiddenEffects && (
        <div className='flex items-center gap-2'>
          <Density slim>
            <Popover isOpen={isTooltipOpen} onClose={() => setIsTooltipOpen(false)}>
              <Popover.Trigger>
                <Button
                  type='button'
                  iconOnly='adornment'
                  icon={CircleEllipsis}
                  onClick={() => setIsTooltipOpen(true)}
                >
                  Show {hiddenEffects.length} more
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <div className='flex flex-col gap-2 p-2'>
                  {hiddenEffects.map((effect, index) => {
                    return (
                      <div key={index} className='flex flex-col gap-1'>
                        {/* Account address */}
                        {effect.address && (
                          <Density slim>
                            <AddressViewComponent truncate hideIcon addressView={effect.address} />
                          </Density>
                        )}
                        {/* Balance changes */}
                        <div className='flex items-center gap-1 flex-wrap'>
                          {effect.balances.map((balance, balanceIndex) => (
                            <SummaryBalance key={balanceIndex} balance={balance} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Popover.Content>
            </Popover>
          </Density>
        </div>
      )}
    </div>
  );
};
