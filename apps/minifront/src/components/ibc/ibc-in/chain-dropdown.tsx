import * as React from 'react';
import { useMemo } from 'react';
import { Avatar, Box, Combobox, Skeleton, Stack, Text } from '@interchain-ui/react';
import { matchSorter } from 'match-sorter';
import { useManager } from '@cosmos-kit/react';
import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';

export interface ChainInfo {
  chainName: string;
  label: string;
  value: string;
  icon?: string;
}

const ChainOption = ({ chainInfo: { label, icon } }: { chainInfo: ChainInfo }) => {
  return (
    <Stack aria-label={`Chain option: ${label}`}>
      <Avatar
        name={label}
        className='mr-2'
        getInitials={name => name[0]!}
        size='xs'
        src={icon}
        fallbackMode='bg'
      />
      <Text>{label}</Text>
    </Stack>
  );
};

const useChainInfos = (): ChainInfo[] => {
  const { chainRecords, getChainLogo } = useManager();
  return useMemo(
    () =>
      chainRecords.map(r => {
        return {
          chainName: r.name,
          label: r.chain?.pretty_name ?? '',
          value: r.name,
          icon: getChainLogo(r.name),
        };
      }),
    [chainRecords, getChainLogo],
  );
};

// Note the console will display aria-label warnings (despite them being present).
// The cosmology team has been notified of the issue.
export const ChainDropdown = () => {
  const chainInfos = useChainInfos();
  const { setChain } = useStore(ibcInSelector);

  const [selectedKey, setSelectedKey] = React.useState<string>();
  const [filterValue, setFilterValue] = React.useState<string>('');

  const filteredItems = React.useMemo(() => {
    return matchSorter(chainInfos, filterValue, {
      keys: ['label', 'value'],
    });
  }, [chainInfos, filterValue]);

  const avatarUrl = filteredItems.find(i => i.value === selectedKey)?.icon ?? undefined;

  return (
    <Box className='flex flex-col items-center justify-center'>
      <div className='font-bold text-stone-700'>Select chain</div>
      <Combobox
        aria-label='Select a chain'
        items={filteredItems}
        inputValue={filterValue}
        openOnFocus
        onInputChange={value => {
          setFilterValue(value);
          if (!value) {
            setChain(undefined);
            setSelectedKey(undefined);
          }
        }}
        selectedKey={selectedKey}
        onSelectionChange={item => {
          if (item) {
            setSelectedKey(item as string);

            const found = chainInfos.find(options => options.value === item) ?? null;

            if (found) {
              setChain(found);
              setFilterValue(found.label);
            }
          }
        }}
        inputAddonStart={
          selectedKey && avatarUrl ? (
            <Avatar
              name={selectedKey.toString()}
              getInitials={name => name[0]!}
              size='xs'
              src={avatarUrl}
              fallbackMode='bg'
              className='px-2'
            />
          ) : (
            <Box className='flex items-center justify-center px-2'>
              <Skeleton width='24px' height='24px' className='rounded-full' />
            </Box>
          )
        }
        styleProps={{
          width: {
            mobile: '100%',
            mdMobile: '350px',
          },
        }}
      >
        {filteredItems.map(info => (
          <Combobox.Item
            key={info.value}
            textValue={info.label}
            aria-label={`Select ${info.label}`}
          >
            <ChainOption chainInfo={info} />
          </Combobox.Item>
        ))}
      </Combobox>
    </Box>
  );
};
