import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { SpendableNoteRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const fetchQuery = async (
  epochIndex: bigint,
  subaccount?: number,
): Promise<Map<string, SpendableNoteRecord>> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  return await Array.fromAsync(
    penumbra.service(ViewService).lqtVotingNotes({ accountFilter, epochIndex }),
  );
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLQTNotes = (epochIndex: bigint, subaccount?: number) => {
  const lqtNotesQuery = useQuery({
    queryKey: ['lqt-notes', subaccount, Number(epochIndex)],
    staleTime: Infinity,
    enabled: connectionStore.connected,
    queryFn: () => fetchQuery(epochIndex, subaccount),
  });

  useRefetchOnNewBlock('lqt-notes', lqtNotesQuery);

  return lqtNotesQuery;
};
