import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf';
import { LqtVotingNotesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';

const fetchQuery = async (subaccount: number, epoch: number): Promise<LqtVotingNotesResponse[]> => {
  const accountFilter = new AddressIndex({ account: subaccount });

  return Array.fromAsync(
    penumbra.service(ViewService).lqtVotingNotes({ accountFilter, epochIndex: BigInt(epoch) }),
  );
};

/**
 * Must be used within the `observer` mobX HOC
 */
export const useLQTNotes = (subaccount: number, epoch?: number, disabled?: boolean) => {
  const lqtNotesQuery = useQuery({
    queryKey: ['lqt-notes', subaccount, epoch],
    staleTime: Infinity,
    enabled: connectionStore.connected,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- based on `enabled`, epoch is always defined
    queryFn: () => fetchQuery(subaccount, epoch!),
  });

  useRefetchOnNewBlock('lqt-notes', lqtNotesQuery, disabled);

  return lqtNotesQuery;
};
