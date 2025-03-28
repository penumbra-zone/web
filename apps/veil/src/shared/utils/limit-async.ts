/**
 * Helper function that allows breaking early when using stream responses
 *
 * Example usage:
 *
 * ```ts
 * await Array.fromAsync(
 *   limitAsync(
 *     penumbra.service(ViewService).ownedPositionIds({}),
 *     limit,
 *     offset,
 *   ),
 * )
 * ```
 */
export async function* limitAsync<T>(
  iterable: AsyncIterable<T>,
  limit: number,
  offset: number,
): AsyncIterable<T> {
  let count = 0;

  for await (const item of iterable) {
    if (count < offset) {
      count++;
      continue;
    }

    if (count >= offset + limit) {
      break;
    }

    yield item;
    count++;
  }
}
