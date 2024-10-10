// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import React from 'react';
import { VStack, Text, HStack } from '@chakra-ui/react';
import { LiquidityPositionEvent } from '@/old/utils/indexer/types/lps';
import CopiedTxToClipboard from '@/old/components/copiedTx';

interface ClosedPositionStatusProps {
  nftId: string;
  lp_event: LiquidityPositionEvent;
}

const ClosedPositionStatus = ({ nftId, lp_event }: ClosedPositionStatusProps) => {
  return (
    <VStack align={'left'} spacing={2}>
      <Text fontSize={'large'} fontWeight={'bold'} paddingBottom='.2em'>
        Position Closed
      </Text>
      <HStack align={'center'} spacing={2}>
        <Text fontSize={'small'} fontFamily={'monospace'}>
          Tx{' '}
        </Text>

        <CopiedTxToClipboard txHash={lp_event.tx_hash} clipboardPopupText={'Tx hash copied'} />
      </HStack>
    </VStack>
  );
};

export default ClosedPositionStatus;
