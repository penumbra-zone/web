import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AssetMetadataByIdRequest,
  AssetMetadataByIdResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices, ShieldedPoolMock } from '../test-utils';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetMetadataById } from './asset-metadata-by-id';

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
      assetMetadata: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          querier: {
            shieldedPool: mockShieldedPool,
          },
        }),
      ),
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.assetMetadataById,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });

    request = new AssetMetadataByIdRequest({
      assetId: assetId,
    });
  });

  test('should successfully get metadata from idb when idb has them', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(metadataFromIdb);
    const metadataByIdResponse = new AssetMetadataByIdResponse(
      await assetMetadataById(request, mockCtx),
    );
    expect(metadataByIdResponse.denomMetadata?.equals(metadataFromIdb)).toBeTruthy();
  });

  test('should successfully get metadata from node if record is not found in idb', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadata.mockResolvedValueOnce(metadataFromNode);
    const metadataByIdResponse = new AssetMetadataByIdResponse(
      await assetMetadataById(request, mockCtx),
    );
    expect(metadataByIdResponse.denomMetadata?.equals(metadataFromNode)).toBeTruthy();
  });

  test('should fail to get metadata when metadata not found in idb and node', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadata.mockResolvedValueOnce(undefined);
    await expect(assetMetadataById(request, mockCtx)).rejects.toThrow();
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
