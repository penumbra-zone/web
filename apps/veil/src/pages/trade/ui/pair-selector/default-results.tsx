import { Search, Ban } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Text } from '@penumbra-zone/ui/Text';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Pair, StarButton, starStore } from '@/features/star-pair';
import { usePairs } from '@/pages/trade/api/use-pairs';
import { shortify } from '@penumbra-zone/types/shortify';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { Skeleton } from '@/shared/ui/skeleton';
import { LoadingAsset } from './loading-asset';

export interface DefaultResultsProps {
  onSelect: (pair: Pair) => void;
}

export const DefaultResults = observer(({ onSelect }: DefaultResultsProps) => {
  const { pairs: starred } = starStore;
  const { data: suggested, isLoading, error } = usePairs();

  if (isLoading) {
    return (
      <div className='mt-4 flex flex-col gap-2'>
        <div className='h-5 min-h-5 w-24'>
          <Skeleton />
        </div>

        <div className='flex flex-col gap-1'>
          {new Array(5).fill(null).map((_, i) => (
            <LoadingAsset key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex grow flex-col items-center justify-center gap-2 py-4 text-text-secondary'>
        <Ban className='size-8 text-destructive-light' />
        <Text small>An error occurred when loading data from the blockchain</Text>
        {/* TODO: add details button  */}
      </div>
    );
  }

  if (!starred.length && !suggested?.length) {
    return (
      <div className='flex grow flex-col items-center justify-center gap-2 py-4 text-text-secondary'>
        <Search className='size-8' />
        <Text small>No results</Text>
      </div>
    );
  }

  return (
    <>
      {!!starred.length && (
        <div className='mt-4 flex flex-col gap-2 text-text-secondary'>
          <Text small>Starred</Text>

          <Dialog.RadioGroup>
            <div className='flex flex-col gap-1'>
              {starred.map(({ base, quote }) => (
                <Dialog.RadioItem
                  key={`starred-${base.symbol}/${quote.symbol}`}
                  value={`${base.symbol}/${quote.symbol}`}
                  title={
                    <div className='flex h-10 items-center'>
                      <Text color='text.primary'>
                        {base.symbol}/{quote.symbol}
                      </Text>
                    </div>
                  }
                  endAdornment={<StarButton adornment pair={{ base, quote }} />}
                  startAdornment={
                    <>
                      <div className='z-10'>
                        <AssetIcon metadata={base} size='lg' />
                      </div>
                      <div className='-ml-4'>
                        <AssetIcon metadata={quote} size='lg' />
                      </div>
                    </>
                  }
                  onSelect={() => onSelect({ base, quote })}
                />
              ))}
            </div>
          </Dialog.RadioGroup>
        </div>
      )}

      <div className='mt-4 flex flex-col gap-2 text-text-secondary'>
        <Text small>Suggested</Text>

        <Dialog.RadioGroup>
          <div className='flex flex-col gap-1'>
            {suggested?.map(({ baseAsset: base, quoteAsset: quote, volume }) => (
              <Dialog.RadioItem
                key={`suggested-${base.symbol}/${quote.symbol}`}
                value={`${base.symbol}/${quote.symbol}`}
                title={
                  <Text color='text.primary'>
                    {base.symbol}/{quote.symbol}
                  </Text>
                }
                description={
                  <div className='-mt-2'>
                    <Text detail color='text.secondary'>
                      Vol ${shortify(Number(getFormattedAmtFromValueView(volume)))}
                    </Text>
                  </div>
                }
                endAdornment={<StarButton adornment pair={{ base, quote }} />}
                startAdornment={
                  <>
                    <div className='z-10'>
                      <AssetIcon metadata={base} size='lg' />
                    </div>
                    <div className='-ml-4'>
                      <AssetIcon metadata={quote} size='lg' />
                    </div>
                  </>
                }
                onSelect={() => onSelect({ base, quote })}
              />
            ))}
          </div>
        </Dialog.RadioGroup>
      </div>
    </>
  );
});
