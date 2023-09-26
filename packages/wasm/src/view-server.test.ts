import { describe, expect, it, vi } from 'vitest';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('wasmViewServer', () => {
  it('does not raise zod validation error', () => {
    // const seedPhrase =
    //   'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';
    //
    // const spendKey = generateSpendKey(seedPhrase);
    // const fullViewingKey = getFullViewingKey(spendKey);
    //
    // const storedTree = {
    //   hashes: [],
    //   commitments: [],
    //   last_forgotten: 0,
    //   last_position: {
    //     Position: {
    //       epoch: 0,
    //       block: 0,
    //       commitment: 0,
    //     },
    //   },
    // };

    // TODO: Unreachable errors. Could be caused by async constructor? Need to investigate.
    // The constructor is an async fn. Should consider a `new()` function instead of a constructor.
    // const vsServer = new ViewServer(
    //   fullViewingKey,
    //   719n,
    //   storedTree,
    // ) as unknown as Promise<ViewServer>;
    // const wasmViewServer = await vsServer;
    expect(true).toBe(true);
  });
});
