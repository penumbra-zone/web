import { ViewService } from '@penumbra-zone/protobuf';
import { SctService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { LqtVotingNotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { statusStore } from '@/shared/model/status';

const fetchQuery = async (
  subaccount?: number,
): Promise<{ notes: Map<string, LqtVotingNotesResponse>; epochIndex?: bigint }> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  const { latestKnownBlockHeight } = statusStore

  let epoch = await penumbra.service(SctService).epochByHeight({ height: latestKnownBlockHeight});
  let epochIndex = epoch.epoch?.index;

  const notes = await Array.fromAsync(
    penumbra.service(ViewService).lqtVotingNotes({ accountFilter, epochIndex }),
  );

  return { notes, epochIndex }
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLQTNotes = (subaccount?: number) => {
  const lqtNotesQuery = useQuery({
    queryKey: ['lqt-notes', subaccount],
    staleTime: Infinity,
    enabled: connectionStore.connected,
    queryFn: () => fetchQuery(subaccount),
  });

  useRefetchOnNewBlock('lqt-notes', lqtNotesQuery);

  return {
    ...lqtNotesQuery,
    notes: lqtNotesQuery.data?.notes,
    epochIndex: lqtNotesQuery.data?.epochIndex
  };
};
