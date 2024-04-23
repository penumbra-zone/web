import { describe, expect, it } from 'vitest';
import { DelegationValueView } from '.';
import { render } from '@testing-library/react';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };

const otherAsset = { inner: u8(32) };

const DELEGATION_TOKEN_METADATA = new Metadata({
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  penumbraAssetId: delAsset,
  symbol: 'delUM(abc...xyz)',
});

const SOME_OTHER_TOKEN_METADATA = new Metadata({
  display: 'someOtherToken',
  base: 'usomeOtherToken',
  denomUnits: [{ denom: 'usomeOtherToken' }, { denom: 'someOtherToken', exponent: 6 }],
  name: 'Some Other Token',
  penumbraAssetId: otherAsset,
  symbol: 'SOT',
});

const STAKING_TOKEN_METADATA = new Metadata({
  display: 'penumbra',
  base: 'penumbra',
  denomUnits: [{ denom: 'upenumbra' }, { denom: 'penumbra', exponent: 6 }],
  name: 'penumbra',
  penumbraAssetId: { inner: new Uint8Array([2, 5, 6, 7]) },
  symbol: 'UM',
});

const validatorInfo = new ValidatorInfo({
  validator: {
    identityKey: {},
    fundingStreams: [
      {
        recipient: {
          case: 'toAddress',
          value: {
            rateBps: 1,
          },
        },
      },
    ],
  },
});

const valueView = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: {
        hi: 0n,
        lo: 1_000_000n,
      },
      metadata: DELEGATION_TOKEN_METADATA,
      equivalentValues: [
        {
          asOfHeight: 123n,
          equivalentAmount: {
            hi: 0n,
            lo: 1_330_000n,
          },
          numeraire: STAKING_TOKEN_METADATA,
        },

        {
          asOfHeight: 123n,
          equivalentAmount: {
            hi: 0n,
            lo: 2_660_000n,
          },
          numeraire: SOME_OTHER_TOKEN_METADATA,
        },
      ],

      extendedMetadata: {
        typeUrl: ValidatorInfo.typeName,
        value: validatorInfo.toBinary(),
      },
    },
  },
});

describe('<DelegationValueView />', () => {
  it('shows balance of the delegation token', () => {
    const { container } = render(
      <DelegationValueView valueView={valueView} stakingTokenMetadata={STAKING_TOKEN_METADATA} />,
    );

    expect(container).toHaveTextContent('1delUM(abc...xyz)');
  });

  it("shows the delegation token's equivalent value in terms of the staking token", () => {
    const { container } = render(
      <DelegationValueView valueView={valueView} stakingTokenMetadata={STAKING_TOKEN_METADATA} />,
    );

    expect(container).toHaveTextContent('1.33UM');
  });

  it('does not show other equivalent values', () => {
    const { container } = render(
      <DelegationValueView valueView={valueView} stakingTokenMetadata={STAKING_TOKEN_METADATA} />,
    );

    expect(container).not.toHaveTextContent('2.66SOT');
  });
});
