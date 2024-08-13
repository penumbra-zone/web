import { describe, expect, it, vi } from 'vitest';
import { DelegationValueView } from '.';
import { render } from '@testing-library/react';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { Any } from '@bufbuild/protobuf';

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
    identityKey: validatorIk,
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

      extendedMetadata: Any.pack(validatorInfo),
    },
  },
});

const mockUseStakingTokenMetadata = vi.hoisted(() => () => ({
  data: STAKING_TOKEN_METADATA,
  error: undefined,
  loading: undefined,
}));

vi.mock('../../../../state/shared', async () => ({
  ...(await vi.importActual('../../../../state/shared')),
  useStakingTokenMetadata: mockUseStakingTokenMetadata,
}));

describe('<DelegationValueView />', () => {
  it('shows balance of the delegation token', () => {
    const { container } = render(<DelegationValueView valueView={valueView} />);

    expect(container).toHaveTextContent('1delUM(abc...xyz)');
  });

  it("shows the delegation token's equivalent value in terms of the staking token", () => {
    const { container } = render(<DelegationValueView valueView={valueView} />);

    expect(container).toHaveTextContent('1.33UM');
  });

  it('does not show other equivalent values', () => {
    const { container } = render(<DelegationValueView valueView={valueView} />);

    expect(container).not.toHaveTextContent('2.66SOT');
  });
});
