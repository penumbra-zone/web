// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// pages/pairs.tsx

import { useState, useEffect } from 'react';
import { VStack, HStack, Box, Select, Button, Avatar } from '@chakra-ui/react';
import Layout from '@/old/components/layout';
import { useTokenAssetsDeprecated } from '@/fetchers/tokenAssets';
import { LoadingSpinner } from '@/old/components/util/loadingSpinner';
import { Token } from '@/old/utils/types/token';

export default function Pairs() {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenAssets, setTokenAssets] = useState<Token[]>([]);
  const { data: tokenAssetsList } = useTokenAssetsDeprecated();

  const [firstAsset, setFirstAsset] = useState('');
  const [secondAsset, setSecondAsset] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const tokens: Token[] = tokenAssetsList.sort((a, b) =>
      a.display > b.display ? 1 : b.display > a.display ? -1 : 0,
    );
    if (tokens.length > 0 && tokenAssets.length === 0) {
      setTokenAssets(tokens);
    }
    setIsLoading(false);
  }, [tokenAssets]);

  const handleSelectEvent = (value: string, assetIndex: number) => {
    if (assetIndex == 0) {
      setFirstAsset(value);
    } else {
      setSecondAsset(value);
    }
  };

  const handleSubmitEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (firstAsset && secondAsset) {
      location.assign('/pair/' + firstAsset.toLowerCase() + ':' + secondAsset.toLowerCase());
    }
  };

  return (
    <Layout pageTitle='Pairs'>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <VStack height={'100%'} width={'100%'}>
          <HStack justifyContent={'space-evenly'} width={'100%'} paddingTop={'5%'}>
            <Box borderColor='gray.200'>
              <VStack>
                <Select
                  placeholder='Select Base Asset'
                  onChange={e => handleSelectEvent(e.target.value, 0)}
                >
                  {tokenAssets.map((x, index) => (
                    <option key={index} value={x.display}>
                      {x.display}
                    </option>
                  ))}
                </Select>
              </VStack>
            </Box>
            <Box>
              <Select
                placeholder='Select Quote Asset'
                onChange={e => handleSelectEvent(e.target.value, 1)}
              >
                {tokenAssets.map(x => (
                  <option key={x.display} value={x.display}>
                    {x.display}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>
          <Box paddingTop='10%'>
            <form onSubmit={handleSubmitEvent}>
              <Button type='submit' variant='outline' colorScheme={'whiteAlpha'}>
                See Graph
              </Button>
            </form>
          </Box>
        </VStack>
      )}
    </Layout>
  );
}
