import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { PositionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import {
  Address,
  FullViewingKey,
  GovernanceKey,
  IdentityKey,
  SpendKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { describe, expect, test } from 'vitest';
import { Inner } from './inner';

describe('The expected inner field exists on the actual types', () => {
  test('passet inner', () => {
    const passet = new AssetId();
    expect(passet[Inner.passet]).toBeDefined();
  });

  test('address inner', () => {
    const address = new Address();
    expect(address[Inner.penumbra]).toBeDefined();
  });

  test('full viewing key inner', () => {
    const fullViewingKey = new FullViewingKey();
    expect(fullViewingKey[Inner.penumbrafullviewingkey]).toBeDefined();
  });

  test('spend key inner', () => {
    const spendKey = new SpendKey();
    expect(spendKey[Inner.penumbraspendkey]).toBeDefined();
  });

  test('governance key gk', () => {
    const governanceKey = new GovernanceKey();
    expect(governanceKey[Inner.penumbragovern]).toBeDefined();
  });

  test('validatorid key ik', () => {
    const validatorId = new IdentityKey();
    expect(validatorId[Inner.penumbravalid]).toBeDefined();
  });

  test('lp id inner', () => {
    const positionId = new PositionId();
    expect(positionId[Inner.plpid]).toBeDefined();
  });

  test('wallet id inner', () => {
    const walletId = new WalletId();
    expect(walletId[Inner.penumbrawalletid]).toBeDefined();
  });
});
