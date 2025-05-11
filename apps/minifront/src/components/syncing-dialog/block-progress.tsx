import { Text } from '@penumbra-zone/ui-deprecated/Text';

export const BlockProgress = ({
  fullSyncHeight,
  latestKnownBlockHeight,
}: {
  fullSyncHeight: bigint;
  latestKnownBlockHeight: bigint;
}) => {
  const percentSynced = `${(
    latestKnownBlockHeight && Number(fullSyncHeight) / Number(latestKnownBlockHeight)
  ).toLocaleString(undefined, { style: 'percent' })} Synced`;

  const blockSyncedOfLatest = `Block ${fullSyncHeight.toLocaleString()} of ${latestKnownBlockHeight.toLocaleString()}`;

  return (
    <Text technical as='div'>
      {`${percentSynced} - ${blockSyncedOfLatest}`}
    </Text>
  );
};
