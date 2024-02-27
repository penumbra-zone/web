import { describe, expect, test } from 'vitest';
import './Promise.withResolvers';

describe('Promise.withResolvers', () => {
  test('resolves', async () => {
    const { promise, resolve } = Promise.withResolvers<number>();
    resolve(42);
    expect(await promise).toBe(42);
  });

  test('rejects', async () => {
    const { promise, reject } = Promise.withResolvers<number>();
    reject(new Error('nope'));
    await expect(promise).rejects.toThrow('nope');
  });

  test('resolves only once', async () => {
    const { promise, resolve } = Promise.withResolvers<number>();
    resolve(42);
    resolve(43);
    await expect(promise).resolves.toBe(42);
  });

  test('rejects only once', async () => {
    const { promise, reject } = Promise.withResolvers<number>();
    reject(new Error('nope'));
    reject(new Error('nope2'));
    await expect(promise).rejects.toThrow('nope');
  });

  test("won't reject after resolving", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<number>();
    resolve(42);
    reject(new Error('nope'));
    await expect(promise).resolves.toBe(42);
  });

  test("won't resolve after rejecting", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<number>();
    reject(new Error('nope'));
    resolve(42);
    await expect(promise).rejects.toThrow('nope');
  });
});
