import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
    WitnessRequest,
    WitnessResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {ServicesInterface} from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices } from './test-utils';
import {witness} from "./witness";
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

describe('Witness request handler', () => {
    let mockServices: MockServices;
    let mockIndexedDb: IndexedDbMock;
    let mockCtx: HandlerContext;
    let req: WitnessRequest;

    beforeEach(() => {
        vi.resetAllMocks();

        mockIndexedDb = {
            getStateCommitmentTree: vi.fn(),
        };
        mockServices = {
            getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
        };
        mockCtx = createHandlerContext({
            service: ViewService,
            method: ViewService.methods.appParameters,
            protocolName: 'mock',
            requestMethod: 'MOCK',
            contextValues: createContextValues().set(
                servicesCtx,
                mockServices as unknown as ServicesInterface,
            ),
        });
        req = new WitnessRequest({
            transactionPlan: testPlan
        })
    });

    test('should successfully create witness', async () => {
        mockIndexedDb.getStateCommitmentTree?.mockResolvedValue(testData);
        const appParameterResponse = new WitnessResponse(
            await witness(req, mockCtx),
        );
        expect(appParameterResponse.parameters?.equals(testData)).toBeTruthy();
    });

    test('should throw error if transaction plan is missing in request', async () => {
        await expect(witness(new WitnessRequest(),mockCtx)).rejects.toThrow()
    });

});

const testSct = new StateCommitmentTree({})
const testPlan = TransactionPlan.fromJson({

})



