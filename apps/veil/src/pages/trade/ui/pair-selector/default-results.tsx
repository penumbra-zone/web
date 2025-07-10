import { Search, Ban } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { Text } from '@penumbra-zone/ui/Text';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { usePairs } from '@/pages/trade/api/use-pairs';
import { shortify } from '@penumbra-zone/types/shortify';
import { Skeleton } from '@/shared/ui/skeleton';
import { useIsLqtEligible } from '@/shared/utils/is-lqt-eligible';
import { Pair, StarButton, starStore } from '@/features/star-pair';
import { LoadingAsset } from './loading-asset';

export interface DefaultResultsProps {
  onSelect: (pair: Pair) => void;
}

const TOURNAMENT_DETAILS_URL = 'https://penumbra.zone/tournament';

const StartAdornment = ({ base, quote }: { base: Metadata; quote: Metadata }) => {
  return (
    <>
      <div className='z-10'>
        <AssetIcon metadata={base} size='lg' />
      </div>
      <div className='-ml-4'>
        <AssetIcon metadata={quote} size='lg' />
      </div>
    </>
  );
};

const EndAdornment = ({ base, quote }: { base: Metadata; quote: Metadata }) => {
  const isLQTEligible = useIsLqtEligible(base, quote);

  return (
    <div className='flex items-center gap-2'>
      {isLQTEligible && (
        <Tooltip
          message={
            <>
              Providing liquidity to these pairs earns you additional rewards as part of the
              Liquidity Tournament.
              <br />
              <span className='text-secondary-light underline'>
                <a href={TOURNAMENT_DETAILS_URL} target='_blank' rel='noreferrer' className=''>
                  Learn More
                </a>
              </span>
            </>
          }
        >
          <div className='flex items-center rounded-xs bg-secondary-dark px-1.5 py-1'>
            <span className='text-textXs bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text font-default text-transparent'>
              Rewards
            </span>
          </div>
        </Tooltip>
      )}

      <StarButton adornment pair={{ base, quote }} />
    </div>
  );
};

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
                  endAdornment={<EndAdornment base={base} quote={quote} />}
                  startAdornment={<StartAdornment base={base} quote={quote} />}
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
                endAdornment={<EndAdornment base={base} quote={quote} />}
                startAdornment={<StartAdornment base={base} quote={quote} />}
                onSelect={() => onSelect({ base, quote })}
              />
            ))}
          </div>
        </Dialog.RadioGroup>
      </div>
    </>
  );
});
