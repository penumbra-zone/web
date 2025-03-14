import { AssetIdSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create } from '@bufbuild/protobuf';
import { PositionIdSchema } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

import {
  AddressSchema,
  FullViewingKeySchema,
  GovernanceKeySchema,
  IdentityKeySchema,
  SpendKeySchema,
  WalletIdSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

import { describe, expect, test } from 'vitest';
import { Inner } from './inner.js';

describe('The expected inner field exists on the actual types', () => {
  test('passet inner', () => {
    const passet = create(AssetIdSchema);
    expect(passet[Inner.passet]).toBeDefined();
  });

  test('address inner', () => {
    const address = create(AddressSchema);
    expect(address[Inner.penumbra]).toBeDefined();
  });

  test('full viewing key inner', () => {
    const fullViewingKey = create(FullViewingKeySchema);
    expect(fullViewingKey[Inner.penumbrafullviewingkey]).toBeDefined();
  });

  test('spend key inner', () => {
    const spendKey = create(SpendKeySchema);
    expect(spendKey[Inner.penumbraspendkey]).toBeDefined();
  });

  test('governance key gk', () => {
    const governanceKey = create(GovernanceKeySchema);
    expect(governanceKey[Inner.penumbragovern]).toBeDefined();
  });

  test('validatorid key ik', () => {
    const validatorId = create(IdentityKeySchema);
    expect(validatorId[Inner.penumbravalid]).toBeDefined();
  });

  test('lp id inner', () => {
    const positionId = create(PositionIdSchema);
    expect(positionId[Inner.plpid]).toBeDefined();
  });

  test('wallet id inner', () => {
    const walletId = create(WalletIdSchema);
    expect(walletId[Inner.penumbrawalletid]).toBeDefined();
  });
});
