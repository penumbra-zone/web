import { IdbUpdate, PenumbraDb, PenumbraTables } from '@penumbra-zone/types/src/indexed-db';

export async function watchSubscription<U extends IdbUpdate<PenumbraDb, PenumbraTables>>(
  subscription: AsyncIterable<U>,
  test: (x: U) => boolean,
): Promise<U['value']> {
  for await (const update of subscription) if (test(update)) return update.value;
  throw new Error('Subscription ended');
}
