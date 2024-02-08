import { base64ToUint8Array } from '@penumbra-zone/types';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

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

export const localAssets: Metadata[] = [
  new Metadata({
    base: 'upenumbra',
    display: 'penumbra',
    penumbraAssetId: {
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    },
    images: [
      {
        png: 'https://raw.githubusercontent.com/penumbra-zone/web/main/apps/webapp/public/favicon.png',
      },
    ],
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
        exponent: 0,
      },
    ],
  }),
  new Metadata({
    base: 'ugm',
    display: 'gm',
    penumbraAssetId: {
      inner: base64ToUint8Array('HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc='),
    },
    denomUnits: [
      {
        denom: 'gm',
        exponent: 6,
      },
      {
        denom: 'mgm',
        exponent: 3,
      },
      {
        denom: 'ugm',
        exponent: 0,
      },
    ],
  }),
  new Metadata({
    base: 'ugn',
    display: 'gn',
    penumbraAssetId: {
      inner: base64ToUint8Array('nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE='),
    },
    denomUnits: [
      {
        denom: 'gn',
        exponent: 6,
      },
      {
        denom: 'mgn',
        exponent: 3,
      },
      {
        denom: 'ugn',
        exponent: 0,
      },
    ],
  }),
  new Metadata({
    base: 'wtest_usd',
    display: 'test_usd',
    penumbraAssetId: {
      inner: base64ToUint8Array('reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg='),
    },
    images: [
      {
        svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.svg',
      },
    ],
    denomUnits: [
      {
        denom: 'test_usd',
        exponent: 18,
      },
      {
        denom: 'wtest_usd',
        exponent: 0,
      },
    ],
  }),
  new Metadata({
    base: 'cube',
    display: 'cube',
    penumbraAssetId: {
      inner: base64ToUint8Array('6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws='),
    },
    denomUnits: [
      {
        denom: 'cube',
        exponent: 0,
      },
    ],
  }),
  new Metadata({
    base: 'pizza',
    display: 'pizza',
    penumbraAssetId: {
      inner: base64ToUint8Array('nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw='),
    },
    images: [
      {
        svg: 'https://raw.githubusercontent.com/giuspen/cherrytree/356649a8f84cd5068d676185937d61fc8e0450d1/icons/ct_pizza.svg',
      },
    ],
    denomUnits: [
      {
        denom: 'pizza',
        exponent: 0,
      },
    ],
  }),
];
