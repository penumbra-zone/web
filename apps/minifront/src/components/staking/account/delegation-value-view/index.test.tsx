import { describe, expect, it } from 'vitest';
import { DelegationValueView } from '.';
import { render } from '@testing-library/react';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

const DELEGATION_TOKEN_METADATA = new Metadata({
  display: 'delegation_penumbravalid1abc123',
  base: 'udelegation_penumbravalid1abc123',
  denomUnits: [
    { denom: 'udelegation_penumbravalid1abc123' },
    { denom: 'delegation_penumbravalid1abc123', exponent: 6 },
  ],
  name: 'Delegation token',
  penumbraAssetId: { inner: new Uint8Array([0, 1, 2, 3]) },
  symbol: 'delUM(abc...xyz)',
});

const SOME_OTHER_TOKEN_METADATA = new Metadata({
  display: 'someOtherToken',
  base: 'usomeOtherToken',
  denomUnits: [{ denom: 'usomeOtherToken' }, { denom: 'someOtherToken', exponent: 6 }],
  name: 'Some Other Token',
  penumbraAssetId: { inner: new Uint8Array([4, 5, 6, 7]) },
  symbol: 'SOT',
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
