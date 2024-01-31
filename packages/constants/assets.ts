import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export interface AssetPattens {
  lpNftPattern: RegExp;
  delegationTokenPattern: RegExp;
  proposalNftPattern: RegExp;
  unbondingTokenPattern: RegExp;
  votingReceiptPattern: RegExp;
}

export const assetPatterns: AssetPattens = {
  lpNftPattern: new RegExp('^lpnft_'),
  delegationTokenPattern: new RegExp('^delegation_'),
  proposalNftPattern: new RegExp('^proposal_'),
  unbondingTokenPattern: new RegExp('^unbonding_'),
  votingReceiptPattern: new RegExp('^voted_on_'),
};

export const assets: DenomMetadata[] = [
  {
    base: 'ugm',
    display: 'gm',
    description: '',
    name: '',
    symbol: '',
    penumbraAssetId: {
      inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'gm',
        exponent: 6,
      },
      {
        aliases: [],
        denom: 'mgm',
        exponent: 3,
      },
      {
        aliases: [],
        denom: 'ugm',
        exponent: 0,
      },
    ],
  },
  {
    base: 'upenumbra',
    display: 'penumbra',
    description: '',
    name: '',
    symbol: '',
    /** @todo: Figure out a better long-term URL for this. */
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'penumbra',
        exponent: 6,
      },
      {
        aliases: [],
        denom: 'mpenumbra',
        exponent: 3,
      },
      {
        aliases: [],
        denom: 'upenumbra',
        exponent: 0,
      },
    ],
  },

  {
    base: 'ugn',
    display: 'gn',
    description: '',
    name: '',
    symbol: '',
    penumbraAssetId: {
      inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'gn',
        exponent: 6,
      },
      {
        aliases: [],
        denom: 'mgn',
        exponent: 3,
      },
      {
        aliases: [],
        denom: 'ugn',
        exponent: 0,
      },
    ],
  },
  {
    base: 'wtest_usd',
    display: 'test_usd',
    description: '',
    name: '',
    symbol: '',
    penumbraAssetId: {
      inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'test_usd',
        exponent: 18,
      },
      {
        aliases: [],
        denom: 'wtest_usd',
        exponent: 0,
      },
    ],
  },
  {
    base: 'cube',
    display: 'cube',
    description: '',
    name: '',
    symbol: '',
    penumbraAssetId: {
      inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'cube',
        exponent: 0,
      },
    ],
  },
].map(dm => DenomMetadata.fromJson(dm));
