import { Text } from '@penumbra-zone/ui-deprecated/Text';

export const BlockProgress = ({
  fullSyncHeight,
  latestKnownBlockHeight,
}: {
  fullSyncHeight: bigint;
  latestKnownBlockHeight: bigint;
}) => {
  const blockProgressString = `Block ${fullSyncHeight} of ${latestKnownBlockHeight}`;
  return (
    <Text technical as='div'>
      {blockProgressString}
    </Text>
  );
};
