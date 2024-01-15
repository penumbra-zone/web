import {
  Denom,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  AssetsRequest,
  AssetsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ServicesInterface } from '@penumbra-zone/types';
import { beforeEach, describe, expect, test } from 'vitest';
import { servicesCtx } from '../../ctx';
import { assets } from './assets';

describe('Assets request handler', () => {
  let req: AssetsRequest;
  let mockServices: ServicesInterface;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockServices = {
      getWalletServices: () =>
        Promise.resolve({
          indexedDb: {
            getAllAssetsMetadata: (): Promise<DenomMetadata[]> => Promise.resolve(testData),
          },
        }),
    } as ServicesInterface;
    mockCtx = createHandlerContext({
      service: ViewProtocolService,
      method: ViewProtocolService.methods.assets,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(servicesCtx, mockServices),
    });
    req = new AssetsRequest({});
  });

  test('empty req return all asset', async () => {
    const responses: AssetsResponse[] = [];
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(8);
  });

  test('req with filtered as false return all asset', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: false,
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(8);
  });

  test('returns only matching denominations when `filtered` is `true`', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: true,
      includeLpNfts: true,
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(4);
  });

  test('req with filtered as false and includeLpNfts as true returns all assets', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: false,
      includeLpNfts: true,
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(8);
  });

  test('includeLpNfts as true returns all LpNfts assets', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: true,
      includeLpNfts: true,
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(4);
  });

  test('includeDelegationTokens as true returns all Delegation Tokens', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: true,
      includeDelegationTokens: true,
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('includeSpecificDenominations include penumbra return only penumbra asset', async () => {
    const responses: AssetsResponse[] = [];
    const req = new AssetsRequest({
      filtered: true,
      includeSpecificDenominations: [
        new Denom({
          denom: 'penumbra',
        }),
      ],
    });
    for await (const res of assets(req, mockCtx)) {
      responses.push(new AssetsResponse(res));
    }
    expect(responses.length).toBe(1);
  });
});

const testData = [
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      {
        denom: 'lpnft_closed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
        exponent: 0,
        aliases: [],
      },
    ],
    base: 'lpnft_closed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    display: 'lpnft_closed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: '+q9m+F1um57vD6mtzpp4zsr4uY6llawZK4osfpNimQc=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      { denom: 'gm', exponent: 6, aliases: [] },
      { denom: 'mgm', exponent: 3, aliases: [] },
      { denom: 'ugm', exponent: 0, aliases: [] },
    ],
    base: 'ugm',
    display: 'gm',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      {
        denom: 'lpnft_withdrawn_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
        exponent: 0,
        aliases: [],
      },
    ],
    base: 'lpnft_withdrawn_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    display: 'lpnft_withdrawn_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'IYAlwlH0ld1wsRLlnYyl4ItsVeukLp4e7/U/Z+6opxA=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      { denom: 'penumbra', exponent: 6, aliases: [] },
      { denom: 'mpenumbra', exponent: 3, aliases: [] },
      { denom: 'upenumbra', exponent: 0, aliases: [] },
    ],
    base: 'upenumbra',
    display: 'penumbra',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      {
        denom: 'lpnft_opened_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
        exponent: 0,
        aliases: [],
      },
    ],
    base: 'lpnft_opened_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    display: 'lpnft_opened_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'ZagbowbVlBeZi5bMUZ3jCf5KDaOipWMSP7iVM/O+PQc=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      {
        denom:
          'delegation_penumbravalid1grwuc89mjkjfjnpey0qaxt0kzy70mhqf5enwzr5tp77jy6mrxy9swy78ph',
        exponent: 6,
        aliases: [],
      },
      {
        denom:
          'mdelegation_penumbravalid1grwuc89mjkjfjnpey0qaxt0kzy70mhqf5enwzr5tp77jy6mrxy9swy78ph',
        exponent: 3,
        aliases: [],
      },
      {
        denom:
          'udelegation_penumbravalid1grwuc89mjkjfjnpey0qaxt0kzy70mhqf5enwzr5tp77jy6mrxy9swy78ph',
        exponent: 0,
        aliases: [],
      },
    ],
    base: 'udelegation_penumbravalid1grwuc89mjkjfjnpey0qaxt0kzy70mhqf5enwzr5tp77jy6mrxy9swy78ph',
    display: 'delegation_penumbravalid1grwuc89mjkjfjnpey0qaxt0kzy70mhqf5enwzr5tp77jy6mrxy9swy78ph',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'hByoL6SVVg9HOwBcMy3TiiJ3Z+OTjhQVi5APR020BAM=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      {
        denom: 'lpnft_claimed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
        exponent: 0,
        aliases: [],
      },
    ],
    base: 'lpnft_claimed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    display: 'lpnft_claimed_plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'mNS0j9YDbrEsQLitqlA9aDJq1NHFJRgYQQCZMgBjlgM=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
  DenomMetadata.fromJson({
    description: '',
    denomUnits: [
      { denom: 'gn', exponent: 6, aliases: [] },
      { denom: 'mgn', exponent: 3, aliases: [] },
      { denom: 'ugn', exponent: 0, aliases: [] },
    ],
    base: 'ugn',
    display: 'gn',
    name: '',
    symbol: '',
    uri: '',
    uriHash: '',
    penumbraAssetId: {
      inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
      altBech32m: '',
      altBaseDenom: '',
    },
  }),
];
