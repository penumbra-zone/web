import { beforeEach, describe, expect, test, vi } from 'vitest';
import { create, equals, fromJson } from '@bufbuild/protobuf';
import {
  AssetMetadataByIdRequestSchema,
  AssetMetadataByIdResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { AssetMetadataByIdRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices, ShieldedPoolMock } from '../test-utils.js';
import {
  AssetIdSchema,
  MetadataSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { assetMetadataById } from './asset-metadata-by-id.js';
import { UM_METADATA } from './util/data.js';

describe('AssetMetadataById request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let mockShieldedPool: ShieldedPoolMock;
  let request: AssetMetadataByIdRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      stakingTokenAssetId: UM_METADATA.penumbraAssetId,
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
      method: ViewService.method.assetMetadataById,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });

    request = create(AssetMetadataByIdRequestSchema, {
      assetId: assetId,
    });
  });

  test('should successfully respond with metadata when idb record is present', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(metadataFromIdb);
    const metadataByIdResponse = await assetMetadataById(request, mockCtx);
    expect(
      equals(
        AssetMetadataByIdResponseSchema,
        create(AssetMetadataByIdResponseSchema, metadataByIdResponse),
        create(AssetMetadataByIdResponseSchema, { denomMetadata: metadataFromIdb }),
      ),
    ).toBeTruthy();
  });

  test('should successfully respond with metadata when idb record is absent, but metadata is available from remote rpc', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadataById.mockResolvedValueOnce(metadataFromNode);
    const metadataByIdResponse = await assetMetadataById(request, mockCtx);
    expect(
      equals(
        AssetMetadataByIdResponseSchema,
        create(AssetMetadataByIdResponseSchema, metadataByIdResponse),
        create(AssetMetadataByIdResponseSchema, { denomMetadata: metadataFromNode }),
      ),
    ).toBeTruthy();
  });

  test('should customize symbols', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadataById.mockResolvedValueOnce(delegationMetadata);
    const metadataByIdResponse = await assetMetadataById(request, mockCtx);
    expect(metadataByIdResponse.denomMetadata!.symbol).toBe(
      'delUM(2s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar)',
    );
  });

  test('should successfully respond even when no metadata is available', async () => {
    mockIndexedDb.getAssetsMetadata?.mockResolvedValue(undefined);
    mockShieldedPool.assetMetadataById.mockResolvedValueOnce(undefined);
    const metadataByIdResponse = await assetMetadataById(request, mockCtx);
    expect(metadataByIdResponse.denomMetadata).toBeUndefined();
  });

  test('should fail if assetId is missing in request', async () => {
    await expect(
      assetMetadataById(create(AssetMetadataByIdRequestSchema), mockCtx),
    ).rejects.toThrow('No asset id passed in request');
  });
});

const assetId = fromJson(AssetIdSchema, {
  inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
});

const metadataFromNode = fromJson(MetadataSchema, {
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
    inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
  },
});

export const delegationMetadata = fromJson(MetadataSchema, {
  denomUnits: [
    {
      denom: 'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar',
      exponent: 6,
    },
    {
      denom: 'mdelegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar',
      exponent: 3,
    },
    {
      denom: 'udelegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar',
    },
  ],
  base: 'udelegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar',
  display: 'delegation_penumbravalid12s9lanucncnyasrsqgy6z532q7nwsw3aqzzeqas55kkpyf6lhsqs2w0zar',
  penumbraAssetId: { inner: '9gOwzeyGwav8YydzDGlEZyZkN8ITX2IerjVy0YjAIw8=' },
});

const metadataFromIdb = fromJson(MetadataSchema, {
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
  priorityScore: '50',
  penumbraAssetId: {
    inner: 'nwPDkQq3OvLnBwGTD+nmv1Ifb2GEmFCgNHrU++9BsRE=',
  },
});
