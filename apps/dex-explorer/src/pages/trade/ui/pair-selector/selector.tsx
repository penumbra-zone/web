'use client';

import { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Skeleton } from '@/shared/ui/skeleton';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';
import { StarButton } from '@/features/star-pair';
import { usePathToMetadata } from '../../model/use-path.ts';
import { handleRouting } from './handle-routing.ts';
import { useFocus } from './use-focus.ts';
import { Trigger } from './trigger';
import { SearchResults } from './search-results';
import { DefaultResults } from './default-results';
import { FilterInput } from './filter-input';

export const PairSelector = observer(() => {
  const router = useRouter();
  const { baseAsset, quoteAsset, error, isLoading } = usePathToMetadata();

  const [isOpen, setIsOpen] = useState(false);
  const [baseFilter, setBaseFilter] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('');
  const [selectedBase, setSelectedBase] = useState<Metadata>();
  const [selectedQuote, setSelectedQuote] = useState<Metadata>();

  const { baseRef, quoteRef, focusedType, clearFocus } = useFocus(isOpen);

  const onClose = useCallback(() => {
    setIsOpen(false);
    clearFocus();
    setQuoteFilter('');
    setBaseFilter('');
    setSelectedQuote(undefined);
    setSelectedBase(undefined);
  }, [clearFocus]);

  const onSelect = useCallback(
    (base: Metadata, quote: Metadata) => {
      handleRouting({ router, baseAsset: base, quoteAsset: quote });
      onClose();
    },
    [router, onClose],
  );

  const onClear = () => {
    clearFocus();
    setQuoteFilter('');
    setBaseFilter('');
  };

  const onConfirm = () => {
    if (selectedBase && selectedQuote) {
      onSelect(selectedBase, selectedQuote);
    }
  };

  if (
    error instanceof Error &&
    ![
      'ConnectError',
      'PenumbraNotInstalledError',
      'PenumbraProviderNotAvailableError',
      'PenumbraProviderNotConnectedError',
    ].includes(error.name)
  ) {
    return <div>Error loading pair selector: ${String(error)}</div>;
  }

  if (isLoading || !baseAsset || !quoteAsset) {
    return (
      <div className='w-[200px]'>
        <Skeleton />
      </div>
    );
  }

  return (
    <div className='relative flex items-center gap-2 text-text-primary'>
      <StarButton pair={{ base: baseAsset, quote: quoteAsset }} />

      <Dialog isOpen={isOpen} onClose={onClose}>
        <Trigger onClick={() => setIsOpen(true)} pair={{ base: baseAsset, quote: quoteAsset }} />

        <Dialog.Content title='Select pair'>
          {/* Focus catcher. If this button wouldn't exist, the focus would go to the first input, which is undesirable */}
          <button type='button' className='w-full h-0 -mt-6 focus:outline-none' />

          <Density sparse>
            <div className='grid grid-cols-[minmax(0,1fr),16px,minmax(0,1fr)] [&_input]:max-w-[calc(100%_-_32px)] gap-2 pt-[2px] items-center'>
              <FilterInput
                ref={baseRef}
                value={baseFilter}
                asset={selectedBase}
                placeholder='Base asset'
                onChange={setBaseFilter}
                onClear={() => setSelectedBase(undefined)}
              />

              <Text body color='text.primary' align='center'>
                /
              </Text>

              <FilterInput
                ref={quoteRef}
                value={quoteFilter}
                asset={selectedQuote}
                placeholder='Quote asset'
                onChange={setQuoteFilter}
                onClear={() => setSelectedQuote(undefined)}
              />
            </div>
          </Density>

          {focusedType === 'base' && (
            <SearchResults
              search={baseFilter}
              showConfirm={!!(selectedQuote && selectedBase)}
              onClear={onClear}
              onConfirm={onConfirm}
              onSelect={asset => {
                setSelectedBase(asset);
                if (!selectedQuote) {
                  quoteRef.current?.focus();
                }
              }}
            />
          )}

          {focusedType === 'quote' && (
            <SearchResults
              search={quoteFilter}
              showConfirm={!!(selectedQuote && selectedBase)}
              onClear={onClear}
              onConfirm={onConfirm}
              onSelect={asset => {
                setSelectedQuote(asset);
                if (!selectedBase) {
                  baseRef.current?.focus();
                }
              }}
            />
          )}

          {!focusedType && <DefaultResults onSelect={pair => onSelect(pair.base, pair.quote)} />}
        </Dialog.Content>
      </Dialog>
    </div>
  );
});
