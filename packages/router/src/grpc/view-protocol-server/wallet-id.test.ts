import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  WalletIdRequest,
  WalletIdResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { extLocalCtx } from '../../ctx';
import { walletId } from './wallet-id';
import { MockExtLocalCtx } from './test-utils';

describe('WalletId request handler', () => {
  let mockExtLocalCtx: MockExtLocalCtx;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockExtLocalCtx = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'wallets') {
          return Promise.resolve([{ id: 'mockWalletId' }]);
        } else {
          return Promise.resolve([]);
        }
      }),
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.walletId,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(extLocalCtx, mockExtLocalCtx as unknown),
    });
  });

  test('should successfully get wallet-id if wallet exists', async () => {
    const walletIdResponse = new WalletIdResponse(await walletId(new WalletIdRequest(), mockCtx));
    expect(walletIdResponse).toBeDefined();
  });

  test('should fail to get wallet-id  if wallet does not exist', async () => {
    mockExtLocalCtx.get.mockImplementation(() => {
      return Promise.resolve([]);
    });
    await expect(walletId(new WalletIdRequest(), mockCtx)).rejects.toThrow('No wallet');
  });
});
