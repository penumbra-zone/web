import { expect } from 'vitest';

export const getSingleMapItem = <T>(map: Map<string, T> | ReadonlyMap<string, T>): T => {
  expect(map.size).toBe(1);
  const onlyItem = map.values().next();
  if (!onlyItem.done) {
    return onlyItem.value;
  }
  expect.unreachable('Map empty');
};
