export interface Constants {
  grpcEndpoint: string;
  indexedDbVersion: number;
}

export const testnetConstants: Constants = {
  grpcEndpoint: 'https://grpc.testnet.penumbra.zone',
  indexedDbVersion: 12,
};

export interface Asset {
  base: string;
  description: string;
  display: string;
  name: string;
  symbol: string;
  uri: string;
  uriHash: string;
  denomUnits: {
    denom: string;
    exponent: number;
    aliases: never[];
  }[];
  penumbraAssetId: {
    inner: string;
    altBech32: string;
    altBaseDenom: string;
  };
  icon?: string;
}

export const assets: Asset[] = [
  {
    base: 'ugm',
    display: 'gm',
    description: '',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
      altBaseDenom: '',
      altBech32: '',
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
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      altBaseDenom: '',
      altBech32: '',
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
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
      altBaseDenom: '',
      altBech32: '',
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
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
      altBaseDenom: '',
      altBech32: '',
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
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
      altBaseDenom: '',
      altBech32: '',
    },
    denomUnits: [
      {
        aliases: [],
        denom: 'cube',
        exponent: 0,
      },
    ],
  },
];
