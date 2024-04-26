import {
  Denom,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  AssetsRequest,
  AssetsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { servicesCtx } from '../ctx/prax';
import { assets } from './assets';
import { IndexedDbMock, MockServices } from '../test-utils';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('Assets request handler', () => {
  let req: AssetsRequest;
  let mockServices: MockServices;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateMetadata = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateMetadata,
    };

    const mockIndexedDb: IndexedDbMock = {
      iterateAssetsMetadata: () => mockIterateMetadata,
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.assets,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });

    for (const record of testData) {
      mockIterateMetadata.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateMetadata.next.mockResolvedValueOnce({
      done: true,
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
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: '+q9m+F1um57vD6mtzpp4zsr4uY6llawZK4osfpNimQc=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'IYAlwlH0ld1wsRLlnYyl4ItsVeukLp4e7/U/Z+6opxA=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'ZagbowbVlBeZi5bMUZ3jCf5KDaOipWMSP7iVM/O+PQc=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'hByoL6SVVg9HOwBcMy3TiiJ3Z+OTjhQVi5APR020BAM=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'mNS0j9YDbrEsQLitqlA9aDJq1NHFJRgYQQCZMgBjlgM=',
    },
  }),
  Metadata.fromJson({
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
    penumbraAssetId: {
      inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
    },
  }),
];
