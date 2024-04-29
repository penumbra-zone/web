import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';
import { useChain, useManager } from '@cosmos-kit/react';
import { Box, Stack } from '@interchain-ui/react';
import {
  Connected,
  Connecting,
  Disconnected,
  Error,
  NotExist,
  Rejected,
  WalletConnectComponent,
} from './wallet-connect-button';
import { MouseEventHandler } from 'react';
import { UserInfo } from './user-info';

const ConnectWalletButtonAlt = () => {
  const { connect, openView, status } = useChainConnector();

  const onClickConnect: MouseEventHandler = e => {
    e.preventDefault();
    void connect();
  };

  const onClickOpenView: MouseEventHandler = e => {
    e.preventDefault();
    openView();
  };

  return (
    <WalletConnectComponent
      walletStatus={status}
      disconnect={<Disconnected buttonText='Connect Wallet' onClick={onClickConnect} />}
      connecting={<Connecting />}
      connected={<Connected buttonText={'My Wallet'} onClick={onClickOpenView} />}
      rejected={<Rejected buttonText='Reconnect' onClick={onClickConnect} />}
      error={<Error buttonText='Change Wallet' onClick={onClickOpenView} />}
      notExist={<NotExist buttonText='Install Wallet' onClick={onClickOpenView} />}
    />
  );
};

const useChainConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { chainRecords } = useManager();
  const defaultChain = chainRecords[0]!.name;
  return useChain(selectedChain?.chainName ?? defaultChain);
};

export const CosmosWalletConnector = () => {
  const { selectedChain } = useStore(ibcInSelector);
  const { username, address, status } = useChainConnector();

  console.log(selectedChain);

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      py='$12'
      width='100%'
      attributes={{
        'data-part-id': 'wallet-section',
      }}
    >
      <Box
        display='grid'
        width='$full'
        maxWidth={{
          mobile: '100%',
          tablet: '450px',
        }}
        gridTemplateColumns='1fr'
        rowGap='$10'
        alignItems='center'
        justifyContent='center'
      >
        {/*{isMultiChain ? (*/}
        {/*  <Box>{chooseChain}</Box>*/}
        {/*) : (*/}
        {/*  <Box marginBottom={'$9'}>*/}
        {/*    <ChainCard prettyName={chain?.label || defaultChainName} icon={chain?.icon} />*/}
        {/*  </Box>*/}
        {/*)}*/}

        <Box px={6}>
          <Stack
            direction='vertical'
            attributes={{
              px: '$2',
              py: '$12',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '$lg',
              backgroundColor: '$white',
              boxShadow: '0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3',
            }}
            space='$8'
          >
            {address && <UserInfo username={username} address={address} status={status} />}

            <Box width='100%' maxWidth='200px' attributes={{ id: 'connect-button' }}>
              <ConnectWalletButtonAlt />
            </Box>

            {/*{connectWalletWarn}*/}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
