import { Button } from '@penumbra-zone/ui/Button';
import { ShieldedBalance } from '@/pages/portfolio/api/use-unified-assets.ts';
import { useEffect, useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { planBuildBroadcast } from '@/entities/transaction';
import {
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import {
  BalancesResponse,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
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
import { WalletBalance } from '@penumbra-zone/ui/WalletBalance';
import { AssetSelector } from '@penumbra-zone/ui/AssetSelector';
import { Density } from '@penumbra-zone/ui/Density';
import { pnum } from '@penumbra-zone/types/pnum';
import { ShieldOff } from 'lucide-react';
import { useRegistry } from '@/shared/api/registry.ts';
import Image from 'next/image';
import { bech32, bech32m } from 'bech32';
import { Chain } from '@penumbra-labs/registry';
import { fromValueView } from '@penumbra-zone/types/amount';
import { Dialog } from '@penumbra-zone/ui/Dialog';

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
  return BigInt(roundedTimeoutMs) * 1_000_000n;
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

async function sendIbcOut(asset: ShieldedBalance, amount: string, destAddress: string) {
  const addressIndex = getAddressIndex(asset.balance);
  const { address: returnAddress } = await penumbra
    .service(ViewService)
    .ephemeralAddress({ addressIndex });
  if (!returnAddress) {
    throw new Error('Error with generating IBC deposit address');
  }

  const denom = getMetadata(asset.valueView).base;
  const channelId = denom.split('/')[1] ?? '';
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
  return await planBuildBroadcast('ics20Withdrawal', req);
}

/**
 * Matches the given address to the chain's address prefix.
 * We don't know what format foreign addresses are in, so this only checks:
 * - it's valid bech32 OR valid bech32m
 * - the prefix matches the chain
 */
function unknownAddrIsValid(chain: Chain | undefined, address: string): boolean {
  if (!chain || address === '') {
    return false;
  }
  const { prefix, words } =
    bech32.decodeUnsafe(address, Infinity) ?? bech32m.decodeUnsafe(address, Infinity) ?? {};
  return !!words && prefix === chain.addressPrefix;
}

export function amountMoreThanBalance(
  asset: BalancesResponse,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean {
  if (!asset.balanceView) {
    throw new Error('Missing balanceView');
  }

  const balanceAmt = fromValueView(asset.balanceView);
  return Boolean(amountInDisplayDenom) && BigNumber(amountInDisplayDenom).gt(balanceAmt);
}

export function UnshieldDialog({ asset }: { asset: ShieldedBalance }) {
  const [amount, setAmount] = useState(pnum(asset.valueView).toString());
  const [destAddress, setDestAddress] = useState('');
  const metadata = getMetadata(asset.valueView);
  const { data: registry } = useRegistry();
  const channelId = metadata.base.split('/')[1] ?? '';
  const destinationChain = registry?.ibcConnections.find(chain => chain.channelId === channelId);

  const [isAddressValid, setIsAddressValid] = useState(true);
  useEffect(() => {
    if (destAddress !== '') {
      setIsAddressValid(unknownAddrIsValid(destinationChain, destAddress));
    }
  }, [destAddress, destinationChain]);

  const [isAmountValid, setIsAmountValid] = useState(true);
  useEffect(() => {
    setIsAmountValid(!amountMoreThanBalance(asset.balance, amount));
  }, [amount, asset.balance]);

  const [isIbcInProgress, setIsIbcInProgress] = useState(false);

  // const { client } = useWalletClient();

  // useEffect(() => {
  //   if (client && destinationChain) {
  //     void client
  //       .getAccount?.(destinationChain.chainId)
  //       .then(acc => setConnectedAddress(acc.address));
  //   } else {
  //     setConnectedAddress(undefined);
  //   }
  // }, [client, destinationChain]);

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button actionType='unshield' density='slim' priority='secondary'>
          Unshield
        </Button>
      </Dialog.Trigger>

      <Dialog.Content title='Unshield'>
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
            startAdornment={
              <Image
                width={24}
                height={24}
                src={destinationChain?.images[0]?.png ?? ''}
                alt={destinationChain?.displayName ?? ''}
              />
            }
            value={destinationChain?.displayName ?? ''}
          />
          <Text variant={'detail'} color={'text.secondary'}>
            Unshielding can only be done to the asset&apos;s source chain.
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
            onChange={value => setAmount(value)}
            value={amount}
          />
          {!isAmountValid && (
            <Text variant={'detail'} color={'destructive.main'}>
              Amount is greater than balance
            </Text>
          )}
          <div
            className={'cursor-pointer w-fit'}
            onClick={() => setAmount(pnum(asset.balance.balanceView).toString())}
          >
            <WalletBalance balance={asset.balance} />
          </div>
          <Text variant={'body'} color={'text.primary'}>
            Destination Address
          </Text>
          <TextInput
            actionType={isAddressValid ? 'default' : 'destructive'}
            onChange={val => setDestAddress(val)}
            // endAdornment={
            //   <Button
            //     onClick={() => {
            //       setDestAddress(connectedAddress ?? '');
            //     }}
            //     disabled={!connectedAddress}
            //     priority='secondary'
            //     density='compact'
            //   >
            //     My address
            //   </Button>
            // }
          />
          {!isAddressValid && destAddress !== '' && (
            <Text variant={'detail'} color={'destructive.main'}>
              This address is not valid on the destination chain
            </Text>
          )}

          <Button
            type='submit'
            actionType={'unshield'}
            priority={'primary'}
            density={'sparse'}
            icon={ShieldOff}
            disabled={!isAddressValid || !isAmountValid || isIbcInProgress}
            onClick={() => {
              void (async () => {
                if (destAddress === '') {
                  return;
                }
                setIsIbcInProgress(true);
                try {
                  await sendIbcOut(
                    asset,
                    pnum(amount, getDisplayDenomExponentFromValueView(asset.valueView)).toString(),
                    destAddress,
                  );
                } finally {
                  setIsIbcInProgress(false);
                }
              })();
            }}
          >
            Unshield
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
