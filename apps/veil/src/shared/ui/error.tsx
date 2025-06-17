'use client';

import { Text } from '@penumbra-zone/ui/Text';

export function Error({ error }: { error: Error }) {
  return (
    <Text large color='destructive.light'>
      {error.message}
    </Text>
  );
}
