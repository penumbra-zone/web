import { Button } from '@penumbra-zone/ui/Button';
import { ShieldedBalance } from '@/pages/portfolio/api/use-unified-assets.ts';
import { useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { planBuildBroadcast } from '@/entities/transaction';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { penumbra } from '@/shared/const/penumbra';
import { getAddressIndex } from '@penumbra-zone/getters/balances-response';
import { Channel } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';
import { ClientState } from '@penumbra-zone/protobuf/ibc/lightclients/tendermint/v1/tendermint_pb';
import { IbcChannelService, IbcClientService, IbcConnectionService } from '@penumbra-zone/protobuf';
import { Height } from '@penumbra-zone/protobuf/ibc/core/client/v1/client_pb';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { WalletBalance } from '@penumbra-zone/ui/WalletBalance';
import { AssetSelector } from '@penumbra-zone/ui/AssetSelector';
import { Density } from '@penumbra-zone/ui/Density';
import { pnum } from '@penumbra-zone/types/pnum';
import { ShieldOff, ShieldOffIcon } from 'lucide-react';

const APPROX_BLOCK_DURATION_MS = 5_500n;
const MINUTE_MS = 60_000n;
export const BLOCKS_PER_MINUTE = MINUTE_MS / APPROX_BLOCK_DURATION_MS;
export const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60n;

const tenMinsMs = 1000 * 60 * 10;
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

// Timeout is two days. However, in order to prevent identifying oneself by clock skew,
// timeout time is rounded up to the nearest 10 minute interval.
// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L1066-L1067
export const currentTimePlusTwoDaysRounded = (currentTimeMs: number): bigint => {
  const twoDaysFromNowMs = currentTimeMs + twoDaysMs;

  // round to next ten-minute interval
  const roundedTimeoutMs = twoDaysFromNowMs + tenMinsMs - (twoDaysFromNowMs % tenMinsMs);

  // 1 million nanoseconds per millisecond (converted to bigint)
  const roundedTimeoutNs = BigInt(roundedTimeoutMs) * 1_000_000n;

  return roundedTimeoutNs;
};

const clientStateForChannel = async (channel?: Channel): Promise<ClientState> => {
  const connectionId = channel?.connectionHops[0];
  if (!connectionId) {
    throw new Error('no connectionId in channel returned from ibcChannelClient request');
  }

  const { connection } = await penumbra.service(IbcConnectionService).connection({
    connectionId,
  });
  const clientId = connection?.clientId;
  if (!clientId) {
    throw new Error('no clientId ConnectionEnd returned from ibcConnectionClient request');
  }

  const { clientState: anyClientState } = await penumbra
    .service(IbcClientService)
    .clientState({ clientId: clientId });
  if (!anyClientState) {
    throw new Error(`Could not get state for client id ${clientId}`);
  }

  const clientState = new ClientState();
  const success = anyClientState.unpackTo(clientState); // Side effect of augmenting input clientState with data
  if (!success) {
    throw new Error(`Error while trying to unpack Any to ClientState for client id ${clientId}`);
  }

  return clientState;
};

// Reference in core: https://github.com/penumbra-zone/penumbra/blob/1376d4b4f47f44bcc82e8bbdf18262942edf461e/crates/bin/pcli/src/command/tx.rs#L998-L1050
const getTimeout = async (
  ibcChannelId: string,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  const { channel } = await penumbra.service(IbcChannelService).channel({
    portId: 'transfer',
    channelId: ibcChannelId,
  });

  const clientState = await clientStateForChannel(channel);
  if (!clientState.latestHeight) {
    throw new Error(`latestHeight not provided in client state for ${clientState.chainId}`);
  }

  return {
    timeoutTime: currentTimePlusTwoDaysRounded(Date.now()),
    timeoutHeight: new Height({
      revisionHeight: clientState.latestHeight.revisionHeight + BLOCKS_PER_HOUR * 3n,
      revisionNumber: clientState.latestHeight.revisionNumber,
    }),
  };
};

async function getIbcOutPlan(asset: ShieldedBalance, amount: string, destAddress: string) {
  const addressIndex = getAddressIndex(asset.balance);
  const { address: returnAddress } = await penumbra
    .service(ViewService)
    .ephemeralAddress({ addressIndex });
  if (!returnAddress) {
    throw new Error('Error with generating IBC deposit address');
  }

  // TODO: validate this is the correct way
  const denom = getMetadata(asset.valueView).base;
  const channelId = denom.split('/')[1]!;
  const { timeoutHeight, timeoutTime } = await getTimeout(channelId);

  const req = new TransactionPlannerRequest({
    ics20Withdrawals: [
      {
        amount: toBaseUnit(
          BigNumber(amount),
          getDisplayDenomExponentFromValueView(asset.valueView),
        ),
        denom: { denom },
        destinationChainAddress: destAddress,
        returnAddress,
        timeoutHeight,
        timeoutTime,
        sourceChannel: channelId,
      },
    ],
    source: addressIndex,
  });
  const plan = await planBuildBroadcast('ics20Withdrawal', req);
  return plan;
}

export function UnshieldDialog({ asset }: { asset: ShieldedBalance }) {
  // FIXME: can't enter decimals
  const [amount, setAmount] = useState(getAmount(asset.valueView));
  const [destAddress, setDestAddress] = useState('');
  const metadata = getMetadata(asset.valueView);
  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <Text variant={'body'} color={'text.primary'}>
        Destination Chain
      </Text>
      <TextInput
        startAdornment={<AssetIcon metadata={metadata} hideBadge={true} />}
        value={'Osmosis'}
      />
      <Text variant={'detail'} color={'text.secondary'}>
        Unshielding can only be done to the asset’s source chain.
      </Text>

      <Text variant={'body'} color={'text.primary'}>
        Amount
      </Text>
      <TextInput
        endAdornment={
          <Density compact>
            <AssetSelector assets={[metadata]} actionType={'default'} value={metadata} />
          </Density>
        }
        onChange={value =>
          setAmount(pnum(value, getDisplayDenomExponentFromValueView(asset.valueView)).toAmount())
        }
        value={pnum(amount, getDisplayDenomExponentFromValueView(asset.valueView)).toString()}
      />
      <WalletBalance
        balance={asset.balance}
        onClick={() => setAmount(getAmount(asset.valueView))}
      />
      <Text variant={'body'} color={'text.primary'}>
        Destination Address
      </Text>
      <TextInput onChange={val => setDestAddress(val)} />

      <Button
        type='submit'
        actionType={'unshield'}
        priority={'primary'}
        density={'sparse'}
        icon={ShieldOff}
        onClick={() => {
          void getIbcOutPlan(
            asset,
            pnum(amount, getDisplayDenomExponentFromValueView(asset.valueView)).toString(),
            destAddress,
          );
        }}
      >
        Unshield
      </Button>
    </form>
  );
}
