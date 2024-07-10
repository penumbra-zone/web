import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AssetMetadataByIdRequest,
  AssetMetadataByIdResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices, ShieldedPoolMock } from '../test-utils.js';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { assetMetadataById } from './asset-metadata-by-id.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('AssetMetadataById request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let mockShieldedPool: ShieldedPoolMock;
  let request: AssetMetadataByIdRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getAssetsMetadata: vi.fn(),
      saveAssetsMetadata: vi.fn(),
    };
    mockShieldedPool = {
      assetMetadataById: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          querier: {
            shieldedPool: mockShieldedPool,
          },
        }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.assetMetadataById,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });

    request = new AssetMetadataByIdRequest({
      assetId: assetId,
    });
  });

  test('should successfully respond with metadata when idb record is present', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(metadataFromIdb);
    const metadataByIdResponse = new AssetMetadataByIdResponse(
      await assetMetadataById(request, mockCtx),
    );
    expect(metadataByIdResponse.equals({ denomMetadata: metadataFromIdb })).toBeTruthy();
  });

  test('should successfully respond with metadata when idb record is absent, but metadata is available from remote rpc', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadataById.mockResolvedValueOnce(metadataFromNode);
    const metadataByIdResponse = new AssetMetadataByIdResponse(
      await assetMetadataById(request, mockCtx),
    );
    expect(metadataByIdResponse.equals({ denomMetadata: metadataFromNode })).toBeTruthy();
  });

  test('should successfully respond even when no metadata is available', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadataById.mockResolvedValueOnce(undefined);
    const metadataByIdResponse = new AssetMetadataByIdResponse(
      await assetMetadataById(request, mockCtx),
    );
    expect(metadataByIdResponse.equals({})).toBeTruthy();
  });

  test('should fail if assetId is missing in request', async () => {
    await expect(assetMetadataById(new AssetMetadataByIdRequest(), mockCtx)).rejects.toThrow(
      'No asset id passed in request',
    );
  });
});

const assetId = AssetId.fromJson({
  inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
});

const metadataFromNode = Metadata.fromJson({
  description: '',
  denomUnits: [
    { denom: 'gm', exponent: 9, aliases: [] },
    { denom: 'mgm', exponent: 3, aliases: [] },
    { denom: 'ugm', exponent: 0, aliases: [] },
  ],
  base: 'ugm',
  display: 'gm',
  name: '',
  symbol: '',
  penumbraAssetId: {
    inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
  },
});
const metadataFromIdb = Metadata.fromJson({
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
});
