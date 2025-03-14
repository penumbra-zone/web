import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@bufbuild/protobuf';
import { StakingActions } from '.';
import { render } from '@testing-library/react';
import { ValidatorInfoSchema } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import {
  ValueView,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AllSlices } from '../../../../../state';
import { IdentityKeySchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const nonZeroBalance = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 1n },
    },
  },
});

const zeroBalance = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 0n },
    },
  },
});

const validatorInfo = create(ValidatorInfoSchema, {
  validator: {
    identityKey: create(IdentityKeySchema, {
      ik: new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4,
        5,
      ]),
    }),
  },
});

let MOCK_STAKING_TOKENS_AND_FILTER: {
  stakingTokens: ValueView | undefined;
  accountSwitcherFilter: number[];
} = vi.hoisted(() => ({
  stakingTokens: undefined,
  accountSwitcherFilter: [],
}));

vi.mock('../../use-staking-tokens-and-filter', () => ({
  useStakingTokensAndFilter: () => MOCK_STAKING_TOKENS_AND_FILTER,
}));

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

vi.mock('../../../../../utils/use-store-shallow', async () => ({
  ...(await vi.importActual('../../../../../utils/use-store-shallow')),
  useStoreShallow: (selector: (state: RecursivePartial<AllSlices>) => unknown) =>
    selector({ staking: { account: 0, votingPowerByValidatorInfo: { '': 0 } } }),
}));

describe('<StakingActions />', () => {
  beforeEach(() => {
    MOCK_STAKING_TOKENS_AND_FILTER = {
      stakingTokens: undefined,
      accountSwitcherFilter: [],
    };
  });

  it('renders an enabled Delegate button there is a non-zero balance of unstaked tokens', () => {
    MOCK_STAKING_TOKENS_AND_FILTER = {
      stakingTokens: nonZeroBalance,
      accountSwitcherFilter: [],
    };

    const { getByText } = render(
      <StakingActions delegationTokens={zeroBalance} validatorInfo={validatorInfo} />,
    );

    expect(getByText('Delegate')).toBeEnabled();
  });

  it('renders an enabled Undelegate button when there is a non-zero balance of delegation tokens', () => {
    const { getByText } = render(
      <StakingActions delegationTokens={nonZeroBalance} validatorInfo={validatorInfo} />,
    );

    expect(getByText('Undelegate')).toBeEnabled();
  });

  it('renders a disabled Delegate button when there is a zero balance of unstaked tokens', () => {
    MOCK_STAKING_TOKENS_AND_FILTER = {
      stakingTokens: zeroBalance,
      accountSwitcherFilter: [],
    };

    const { getByText } = render(
      <StakingActions delegationTokens={nonZeroBalance} validatorInfo={validatorInfo} />,
    );

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Delegate button when staking tokens are undefined', () => {
    const { getByText } = render(
      <StakingActions delegationTokens={nonZeroBalance} validatorInfo={validatorInfo} />,
    );

    expect(getByText('Delegate')).toBeDisabled();
  });

  it('renders a disabled Undelegate button when there is a zero balance of delegation tokens', () => {
    MOCK_STAKING_TOKENS_AND_FILTER = {
      stakingTokens: nonZeroBalance,
      accountSwitcherFilter: [],
    };

    const { getByText } = render(
      <StakingActions delegationTokens={zeroBalance} validatorInfo={validatorInfo} />,
    );

    expect(getByText('Undelegate')).toBeDisabled();
  });
});
