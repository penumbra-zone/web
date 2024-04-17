import { Chain as PenumbraChain } from '@penumbra-zone/constants/src/chains';
import { ibcClient } from '../clients';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { Height } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';

/*
export const getTimeout = async (
  chain: PenumbraChain,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  // timeout 2 days from now, in nanoseconds since epoch
  const twoDaysMs = BigInt(2 * 24 * 60 * 60 * 1000); // 2 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds per second

  // truncate resolution at seconds, to obfuscate clock skew
  const lowPrecisionNowMs = BigInt(Math.floor(Date.now() / 1000) * 1000); // ms/1000 to second, floor, second*1000 to ms

  // (now + two days) as nanoseconds
  const timeoutTime = (lowPrecisionNowMs + twoDaysMs) * 1000000n; // 1 million nanoseconds per millisecond

  const { clientStates: anyClientStates } = await ibcClient.clientStates({});

  const clientState = anyClientStates
    .flatMap(({ clientState: anyClientState }) => {
      const cs = new ClientState();
      return anyClientState?.unpackTo(cs) && cs;
    })
    .find(cs => cs && cs.chainId === chain.chainId);

  if (!clientState) throw new Error('Could not identify chain state');

  // assuming a block time of 10s and adding ~1000 blocks (~3 hours)
  const timeoutHeight = new Height(clientState.latestHeight);
  timeoutHeight.revisionHeight += 1000n;

  return {
    timeoutTime,
    timeoutHeight,
  };
};
*/

export const getTimeout = async (
  chain: PenumbraChain,
): Promise<{ timeoutTime: bigint; timeoutHeight: Height }> => {
  // timeout 2 days from now, in nanoseconds since epoch
  const twoDaysMs = BigInt(2 * 24 * 60 * 60 * 1000); // 2 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds per second
  // truncate resolution at seconds, to obfuscate clock skew
  const lowPrecisionNowMs = BigInt(Math.floor(Date.now() / 1000) * 1000); // ms/1000 to second, floor, second*1000 to ms
  // (now + two days) as nanoseconds
  const timeoutTime = (lowPrecisionNowMs + twoDaysMs) * 1_000_000n; // 1 million nanoseconds per millisecond

  const { clientStates } = await ibcClient.clientStates({});
  const unpacked = clientStates
    .map(cs => cs.clientState!.unpack(typeRegistry))
    .filter(Boolean) as ClientState[];

  const clientState = unpacked.find(cs => cs.chainId === chain.chainId);
  if (!clientState) throw new Error('Could not find chain id client state');

  // assuming a block time of 10s and adding ~1000 blocks (~3 hours)
  const revisionHeight = clientState.latestHeight!.revisionHeight + 1000n;

  return {
    timeoutTime,
    timeoutHeight: new Height({
      revisionHeight,
      revisionNumber: clientState.latestHeight!.revisionNumber,
    }),
  };
};
