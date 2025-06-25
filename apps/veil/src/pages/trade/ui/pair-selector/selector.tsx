'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
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
  const { baseAsset, quoteAsset } = usePathToMetadata();

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

  const onConfirm = () => {
    if (selectedBase && selectedQuote) {
      onSelect(selectedBase, selectedQuote);
    }
  };

  const showConfirm =
    !!selectedBase &&
    !!selectedQuote &&
    (selectedBase.symbol !== baseAsset?.symbol || selectedQuote.symbol !== quoteAsset?.symbol);

  let dialogButton: ReactNode = null;
  if (showConfirm) {
    dialogButton = (
      <Button onClick={onConfirm} priority='primary' actionType='accent'>
        Confirm
      </Button>
    );
  } else if (focusedType) {
    dialogButton = (
      <Button onClick={onClear} priority='primary'>
        Clear
      </Button>
    );
  }

  if (!baseAsset || !quoteAsset) {
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

        <Dialog.Content
          title='Select pair'
          buttons={dialogButton && <div className='p-6'>{dialogButton}</div>}
        >
          {/* Focus catcher. If this button wouldn't exist, the focus would go to the first input, which is undesirable */}
          <button type='button' className='-mt-6 h-0 w-full focus:outline-hidden' />

          <Density sparse>
            <div className='grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2 pt-[2px] [&_input]:max-w-[calc(100%-32px)]'>
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
        </Dialog.Content>
      </Dialog>
    </div>
  );
});
