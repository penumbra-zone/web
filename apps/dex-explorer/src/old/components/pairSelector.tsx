import { useEffect, useState } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { useTokenAssetsDeprecated } from '@/fetchers/tokenAssets';
import OutsideClickHandler from 'react-outside-click-handler';
import { Token } from '@/old/utils/types/token';

const orderedAssets = ['UM', 'USDC'];

export default function PairSelector({
  show,
  setShow,
  onSelect,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  onSelect: (assets: [Token, Token]) => void;
}) {
  const { data: tokenAssetsList } = useTokenAssetsDeprecated();
  const tokenAssets = Object.fromEntries(tokenAssetsList.map(asset => [asset.symbol, asset]));
  const [selectedAssets, setSelectedAssets] = useState<Token[]>([]);

  useEffect(() => {
    setSelectedAssets([]);
  }, [show]);

  useEffect(() => {
    if (selectedAssets.length === 2) {
      onSelect(selectedAssets as [Token, Token]);
      setShow(false);
    }
  }, [selectedAssets, onSelect, setShow]);

  return (
    <OutsideClickHandler onOutsideClick={() => setShow(false)}>
      <Box
        display={show ? 'block' : 'none'}
        position='absolute'
        top='100%'
        left='0'
        width={360}
        zIndex={1000}
        p={2}
        border='1px solid rgba(255, 255, 255, 0.1)'
        borderRadius={10}
        background='var(--charcoal)'
        maxHeight={300}
        overflow='scroll'
        textAlign='left'
      >
        <Text fontSize={15} fontWeight={600} py={2} px={4} mb={2}>
          {!selectedAssets.length ? 'Select Base Asset' : 'Select Quote Asset'}
        </Text>
        {[
          ...orderedAssets.map(symbol => tokenAssets[symbol]),
          ...Object.values(tokenAssets)
            .filter(asset => !orderedAssets.includes(asset.symbol))
            .sort((a, b) => {
              return a.symbol.localeCompare(b.symbol);
            }),
        ]
          .filter(asset => asset && !selectedAssets.includes(asset))
          .map(asset => {
            if (!asset) {
              return null;
            }
            return (
              <Flex
                key={asset.symbol}
                as='button'
                width='100%'
                py={2}
                px={4}
                borderRadius={10}
                _hover={{ background: 'var(--body-background)' }}
                onClick={() => setSelectedAssets([...selectedAssets, asset])}
              >
                <Text fontSize={14} fontWeight={600} mr={2}>
                  {asset.symbol}
                </Text>
                <Text fontSize={14} opacity='0.75'>
                  {asset.display}
                </Text>
              </Flex>
            );
          })}
      </Box>
    </OutsideClickHandler>
  );
}
