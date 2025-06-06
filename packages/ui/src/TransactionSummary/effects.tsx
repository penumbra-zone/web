import { CircleEllipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AddressViewComponent } from '../AddressView';
import { Button } from '../Button';
import { SummaryBalance } from './balance';
import { Density } from '../Density';
import { Popover } from '../Popover';
import { SummaryEffect } from './adapt-effects';

export interface SummaryEffectsProps {
  effects: SummaryEffect[];
}

export const SummaryEffects = ({ effects }: SummaryEffectsProps) => {
  return (
    <div className='flex flex-col'>
      {effects.map((effect, effectIndex) => (
        <EffectRow key={effectIndex} effect={effect} />
      ))}
    </div>
  );
};

interface EffectRowProps {
  effect: SummaryEffect;
}

const EffectRow = ({ effect }: EffectRowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(effect.balances.length);
  const firstBalance = effect.balances[0];

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const measureWidth = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Get available width (account for address and gaps)
      const totalWidth = container.offsetWidth;
      const addressWidth = effect.address ? 140 : 0;
      const ellipsisWidth = 32;
      const availableWidth = totalWidth - addressWidth - ellipsisWidth - 16;

      // Estimate how many balance changes can fit
      const estimatedBalanceWidth = 70;
      const maxVisible = Math.floor(availableWidth / estimatedBalanceWidth);
      const newVisibleCount = Math.max(1, Math.min(maxVisible, effect.balances.length));

      setVisibleCount(newVisibleCount);
    };

    measureWidth();
    const resizeObserver = new ResizeObserver(measureWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [effect.balances.length, effect.address]);

  if (!firstBalance) {
    return null;
  }

  const visibleBalances = effect.balances.slice(0, visibleCount);
  const hasHiddenBalances = visibleCount < effect.balances.length;

  return (
    <div ref={containerRef} className='flex items-center gap-1'>
      {/* Balance changes for this account */}
      <div className='flex min-w-0 items-center gap-1'>
        {visibleBalances.map((balance, balanceIndex) => (
          <div key={balanceIndex} className='flex truncate'>
            <SummaryBalance balance={balance} />
          </div>
        ))}

        {/* Show ellipsis popover only when there are hidden balances */}
        {hasHiddenBalances && (
          <Density slim>
            <Popover>
              <Popover.Trigger>
                <Button
                  type='button'
                  iconOnly={'adornment'}
                  icon={CircleEllipsis}
                  priority='secondary'
                  density='slim'
                >
                  Show {effect.balances.length - visibleCount} more balance changes
                </Button>
              </Popover.Trigger>

              <Popover.Content side='top' align='start'>
                <div className='flex w-fit min-w-0 max-w-none flex-col'>
                  {effect.balances.map((balance, balanceIndex) => (
                    <SummaryBalance key={balanceIndex} balance={balance} />
                  ))}
                </div>
              </Popover.Content>
            </Popover>
          </Density>
        )}
      </div>

      {/* Account address */}
      {effect.address && (
        <Density slim>
          <div className='max-w-32 shrink-0'>
            <AddressViewComponent truncate hideIcon addressView={effect.address} />
          </div>
        </Density>
      )}
    </div>
  );
};
