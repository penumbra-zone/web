import { Text } from '@penumbra-zone/ui/Text';

export const BlockProgress = ({
  syncHeight,
  latestKnownBlockHeight,
}: {
  syncHeight: bigint;
  latestKnownBlockHeight: bigint;
}) => {
  const percentSynced = `${(
    latestKnownBlockHeight && Number(syncHeight) / Number(latestKnownBlockHeight)
  ).toLocaleString(undefined, { style: 'percent' })} Synced`;

  const blockSyncedOfLatest = `Block ${syncHeight.toLocaleString()} of ${latestKnownBlockHeight.toLocaleString()}`;

  return (
    <Text technical as='div'>
      {`${percentSynced} - ${blockSyncedOfLatest}`}
    </Text>
  );
};
