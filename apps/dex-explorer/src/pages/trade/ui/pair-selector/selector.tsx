'use client';

import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Skeleton } from '@/shared/ui/skeleton';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
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

  useEffect(() => {
    if (isOpen) {
      setSelectedBase(baseAsset);
      setSelectedQuote(quoteAsset);
    }
  }, [baseAsset, isOpen, quoteAsset]);

  const onSelect = useCallback(
    (base: Metadata, quote: Metadata) => {
      handleRouting({ router, baseAsset: base, quoteAsset: quote });
      onClose();
    },
    [router, onClose],
  );

  const onClear = () => {
    onFocusClear();
    setQuoteFilter('');
    setBaseFilter('');
  };

  const onFocusClear = () => {
    clearFocus();

    // Scroll to top after selecting an asset
    const scrollable = (baseRef.current ?? quoteRef.current)?.closest('.overflow-y-auto');
    setTimeout(() => scrollable?.scrollTo({ top: 0 }), 0);
  };

  const onBaseReset = () => {
    setSelectedBase(undefined);
    setTimeout(() => baseRef.current?.focus(), 0);
  };

  const onQuoteReset = () => {
    setSelectedQuote(undefined);
    setTimeout(() => quoteRef.current?.focus(), 0);
  };

  const showConfirm =
    !!selectedBase &&
    !!selectedQuote &&
    (selectedBase.symbol !== baseAsset?.symbol || selectedQuote.symbol !== quoteAsset?.symbol);

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
                onClear={onBaseReset}
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
                onClear={onQuoteReset}
              />
            </div>
          </Density>

          {focusedType === 'base' && (
            <SearchResults
              search={baseFilter}
              onClear={onClear}
              onSelect={asset => {
                setSelectedBase(asset);
                if (!selectedQuote) {
                  quoteRef.current?.focus();
                } else {
                  onFocusClear();
                }
              }}
            />
          )}

          {focusedType === 'quote' && (
            <SearchResults
              search={quoteFilter}
              onClear={onClear}
              onSelect={asset => {
                setSelectedQuote(asset);
                if (!selectedBase) {
                  baseRef.current?.focus();
                } else {
                  onFocusClear();
                }
              }}
            />
          )}

          {!focusedType && <DefaultResults onSelect={pair => onSelect(pair.base, pair.quote)} />}

          {showConfirm && (
            <div className='flex flex-col gap-4 sticky bottom-0 w-full rounded-sm z-10'>
              <Button onClick={onConfirm} priority='primary' actionType='accent'>
                Confirm
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
});
