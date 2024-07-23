import type { Meta, StoryObj } from '@storybook/react';
import { ValueViewComponent } from '.';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };
const unbondString = 'unbonding_start_at_123_' + validatorIkString;
const uunbondString = 'uunbonding_start_at_123_' + validatorIkString;
const unbondAsset = { inner: u8(32) };

const DELEGATION_TOKEN_METADATA = new Metadata({
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  penumbraAssetId: delAsset,
  symbol: 'delUM(abc...xyz)',
});

const UNBONDING_TOKEN_METADATA = new Metadata({
  display: unbondString,
  base: uunbondString,
  denomUnits: [{ denom: uunbondString }, { denom: unbondString, exponent: 6 }],
  name: 'Unbonding token',
  penumbraAssetId: unbondAsset,
  symbol: 'unbondUMat123(abc...xyz)',
});

const PENUMBRA_METADATA = new Metadata({
  denomUnits: [
    {
      denom: 'penumbra',
      exponent: 6,
    },
    {
      denom: 'mpenumbra',
      exponent: 3,
    },
    {
      denom: 'upenumbra',
    },
  ],
  base: 'upenumbra',
  display: 'penumbra',
  symbol: 'UM',
  penumbraAssetId: {
    altBaseDenom: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

const PENUMBRA_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: PENUMBRA_METADATA,
    },
  },
});

const DELEGATION_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: DELEGATION_TOKEN_METADATA,
    },
  },
});

const UNBONDING_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: UNBONDING_TOKEN_METADATA,
    },
  },
});

const meta: Meta<typeof ValueViewComponent> = {
  component: ValueViewComponent,
  tags: ['autodocs', '!dev'],
  argTypes: {
    valueView: {
      options: ['Penumbra', 'Delegation token', 'Unbonding token'],
      mapping: {
        Penumbra: PENUMBRA_VALUE_VIEW,
        'Delegation token': DELEGATION_VALUE_VIEW,
        'Unbonding token': UNBONDING_VALUE_VIEW,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ValueViewComponent>;

export const Basic: Story = {
  args: {
    valueView: PENUMBRA_VALUE_VIEW,
    context: 'default',
    size: 'sparse',
  },
};
