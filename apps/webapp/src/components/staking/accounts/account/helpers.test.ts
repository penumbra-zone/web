import { describe, expect, it } from 'vitest';
import { getBech32IdentityKeyFromValueView } from './helpers';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const VALIDATOR_BECH32_IDENTITY_KEY =
  'penumbravalid18nkv0r3sfp2seleq6du5kt3mhfce3k6cqm77kj2e7mhakmyw9v9qx42a20';

const delegationMetadata = Metadata.fromJson({
  display: `delegation_${VALIDATOR_BECH32_IDENTITY_KEY}`,
});

const unbondingMetadata = Metadata.fromJson({
  display: `uunbonding_epoch_1_${VALIDATOR_BECH32_IDENTITY_KEY}`,
});

describe('getBech32IdentityKeyFromValueView()', () => {
  describe('when the passed-in value view contains a delegation token', () => {
    it('accurately gets the validator identity key', () => {
      const valueView = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: delegationMetadata,
          },
        },
      });

      expect(getBech32IdentityKeyFromValueView(valueView)).toBe(VALIDATOR_BECH32_IDENTITY_KEY);
    });
  });

  describe('when the passed-in value view contains an unbonding token', () => {
    it('accurately gets the validator identity key', () => {
      const valueView = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: unbondingMetadata,
          },
        },
      });

      expect(getBech32IdentityKeyFromValueView(valueView)).toBe(VALIDATOR_BECH32_IDENTITY_KEY);
    });
  });
});
