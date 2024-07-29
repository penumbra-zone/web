import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import {
  SwapRecord,
  TransactionPlannerRequest,
  TransactionPlannerRequest_ActionDutchAuctionEnd,
  TransactionPlannerRequest_ActionDutchAuctionSchedule,
  TransactionPlannerRequest_ActionDutchAuctionWithdraw,
  TransactionPlannerRequest_Output,
  TransactionPlannerRequest_Swap,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { extractAltFee } from './fees.js';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb.js';
import { IndexedDbMock } from '../test-utils.js';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';

describe('extractAltFee', () => {
  let mockIndexedDb: IndexedDbMock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockIndexedDb = {
      getSwapByCommitment: vi.fn(),
      upsertAuction: vi.fn(),
      saveAssetsMetadata: vi.fn(),
      getAuction: vi.fn(),
      hasTokenBalance: vi.fn(),
      saveGasPrices: vi.fn(),
      getAltGasPrices: vi.fn(),
    };
  });

  it('extracts the staking asset fee from outputs', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        41, 234, 156, 47, 51, 113, 246, 164, 135, 231, 233, 92, 36, 112, 65, 244, 163, 86, 249, 131,
        235, 6, 78, 93, 43, 59, 207, 50, 44, 169, 106, 16,
      ]),
    });
    const request = new TransactionPlannerRequest({
      outputs: [
        {
          value: { assetId: inputAssetId },
        },
      ],
    });
    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the alternative asset fee from outputs', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });
    const request = new TransactionPlannerRequest({
      outputs: [
        {
          value: { assetId: inputAssetId },
        },
      ],
    });
    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('skips over outputs that do not have assetIds', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        41, 234, 156, 47, 51, 113, 246, 164, 135, 231, 233, 92, 36, 112, 65, 244, 163, 86, 249, 131,
        235, 6, 78, 93, 43, 59, 207, 50, 44, 169, 106, 16,
      ]),
    });
    const request = new TransactionPlannerRequest({
      outputs: [
        new TransactionPlannerRequest_Output({}),
        new TransactionPlannerRequest_Output({
          value: { assetId: inputAssetId },
        }),
      ],
    });
    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('prioritizes outputs over all else', async () => {
    const outputAssetId = new AssetId({ altBaseDenom: 'output' });
    const swapAssetId = new AssetId({ altBaseDenom: 'swap' });
    const auctionScheduleAssetId = new AssetId({ altBaseDenom: 'auction-schedule' });
    const auctionEndAuctionId = new AuctionId({ inner: new Uint8Array([3, 2, 5, 2]) });
    const auctionWithdrawAuctiontId = new AuctionId({ inner: new Uint8Array([9, 9, 6, 3]) });

    const request = new TransactionPlannerRequest({
      outputs: [
        new TransactionPlannerRequest_Output({
          value: { assetId: outputAssetId },
        }),
      ],
      swaps: [
        new TransactionPlannerRequest_Swap({
          value: { assetId: swapAssetId },
        }),
      ],
      dutchAuctionScheduleActions: [
        new TransactionPlannerRequest_ActionDutchAuctionSchedule({
          description: { outputId: auctionScheduleAssetId },
        }),
      ],
      dutchAuctionEndActions: [
        new TransactionPlannerRequest_ActionDutchAuctionEnd({
          auctionId: auctionEndAuctionId,
        }),
      ],
      dutchAuctionWithdrawActions: [
        new TransactionPlannerRequest_ActionDutchAuctionWithdraw({
          auctionId: auctionWithdrawAuctiontId,
        }),
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(outputAssetId)).toBeTruthy();
  });

  it('extracts the staking asset fee from swaps', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(mockSwapNativeStakingToken);

    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        41, 234, 156, 47, 51, 113, 246, 164, 135, 231, 233, 92, 36, 112, 65, 244, 163, 86, 249, 131,
        235, 6, 78, 93, 43, 59, 207, 50, 44, 169, 106, 16,
      ]),
    });
    const request = new TransactionPlannerRequest({
      swaps: [
        new TransactionPlannerRequest_Swap({
          value: { assetId: inputAssetId },
        }),
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the alternative asset fee from swaps', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(mockSwapAlternativeToken);

    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });
    const request = new TransactionPlannerRequest({
      swaps: [
        {
          value: { assetId: inputAssetId },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the staking asset fee from swap claims', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(mockSwapNativeStakingToken);

    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        41, 234, 156, 47, 51, 113, 246, 164, 135, 231, 233, 92, 36, 112, 65, 244, 163, 86, 249, 131,
        235, 6, 78, 93, 43, 59, 207, 50, 44, 169, 106, 16,
      ]),
    });

    const request = new TransactionPlannerRequest({
      swapClaims: [
        {
          swapCommitment: mockSwapCommitmentNativeStakingToken,
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the alternative asset fee from swap claims', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(mockSwapAlternativeToken);

    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const request = new TransactionPlannerRequest({
      swapClaims: [
        {
          swapCommitment: mockSwapCommitmentAlternativeToken,
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the asset fee from dutchAuctionScheduleActions', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const request = new TransactionPlannerRequest({
      dutchAuctionScheduleActions: [
        {
          description: {
            input: {
              amount: { hi: 0n, lo: 0n },
              assetId: inputAssetId,
            },
          },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the asset fee from dutchAuctionEndActions', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const auction = new DutchAuctionDescription({
      input: {
        assetId: inputAssetId,
      },
    });

    mockIndexedDb.getAuction?.mockResolvedValueOnce({
      auction,
      noteCommitment: mockAuctionEndCommitment,
      seqNum: 0n,
    });

    mockIndexedDb.hasTokenBalance?.mockResolvedValueOnce(true);

    const request = new TransactionPlannerRequest({
      dutchAuctionEndActions: [
        {
          auctionId: { inner: new Uint8Array([]) },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts a different asset fee from dutchAuctionEndActions', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const auction = new DutchAuctionDescription({
      input: {
        assetId: inputAssetId,
      },
    });

    mockIndexedDb.getAuction?.mockResolvedValueOnce({
      auction,
      noteCommitment: mockAuctionEndCommitment,
      seqNum: 0n,
    });

    // Retrieve a different asset ID than the original scheduled auction.
    const anotherAssetId = new AssetId({
      inner: new Uint8Array([0, 1, 2, 3]),
    });

    const gasPrices = [
      new GasPrices({
        assetId: anotherAssetId,
        blockSpacePrice: 1n,
        compactBlockSpacePrice: 1n,
        verificationPrice: 1n,
        executionPrice: 1n,
      }),
    ];

    mockIndexedDb.hasTokenBalance?.mockResolvedValue(false);
    mockIndexedDb.saveGasPrices?.mockResolvedValueOnce(gasPrices);
    mockIndexedDb.getAltGasPrices?.mockResolvedValueOnce(gasPrices);
    mockIndexedDb.hasTokenBalance?.mockResolvedValue(true);

    const request = new TransactionPlannerRequest({
      dutchAuctionEndActions: [
        {
          auctionId: { inner: new Uint8Array([]) },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts the asset fee from dutchAuctionWithdrawAuctions', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const auction = new DutchAuctionDescription({
      input: {
        assetId: inputAssetId,
      },
    });

    mockIndexedDb.getAuction?.mockResolvedValueOnce({
      auction,
      noteCommitment: mockAuctionEndCommitment,
      seqNum: 0n,
    });

    mockIndexedDb.hasTokenBalance?.mockResolvedValueOnce(true);

    const request = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [
        {
          auctionId: { inner: new Uint8Array([]) },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });

  it('extracts a different asset fee from dutchAuctionWithdrawAuctions', async () => {
    const inputAssetId = new AssetId({
      inner: new Uint8Array([
        29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174, 189,
        148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
      ]),
    });

    const auction = new DutchAuctionDescription({
      input: {
        assetId: inputAssetId,
      },
    });

    mockIndexedDb.getAuction?.mockResolvedValueOnce({
      auction,
      noteCommitment: mockAuctionEndCommitment,
      seqNum: 0n,
    });

    // Retrieve a different asset ID than the original scheduled auction.
    const anotherAssetId = new AssetId({
      inner: new Uint8Array([0, 1, 2, 3]),
    });

    const gasPrices = [
      new GasPrices({
        assetId: anotherAssetId,
        blockSpacePrice: 1n,
        compactBlockSpacePrice: 1n,
        verificationPrice: 1n,
        executionPrice: 1n,
      }),
    ];

    mockIndexedDb.hasTokenBalance?.mockResolvedValue(false);
    mockIndexedDb.saveGasPrices?.mockResolvedValueOnce(gasPrices);
    mockIndexedDb.getAltGasPrices?.mockResolvedValueOnce(gasPrices);
    mockIndexedDb.hasTokenBalance?.mockResolvedValue(true);

    const request = new TransactionPlannerRequest({
      dutchAuctionWithdrawActions: [
        {
          auctionId: { inner: new Uint8Array([]) },
        },
      ],
    });

    const result = await extractAltFee(request, mockIndexedDb as unknown as IndexedDbInterface);
    expect(result.equals(inputAssetId)).toBeTruthy();
  });
});

const mockAuctionEndCommitment = StateCommitment.fromJson({
  inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=',
});

const mockSwapCommitmentNativeStakingToken = StateCommitment.fromJson({
  inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=',
});

const mockSwapCommitmentAlternativeToken = StateCommitment.fromJson({
  inner: 'B6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=',
});

const mockSwapNativeStakingToken = SwapRecord.fromJson({
  swapCommitment: { inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
  swap: {
    tradingPair: {
      asset1: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
      asset2: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
    },
    delta1I: {},
    delta2I: { lo: '1000000' },
    claimFee: {
      amount: { hi: '0', lo: '0' },
      assetId: {
        inner: uint8ArrayToBase64(
          new Uint8Array([
            41, 234, 156, 47, 51, 113, 246, 164, 135, 231, 233, 92, 36, 112, 65, 244, 163, 86, 249,
            131, 235, 6, 78, 93, 43, 59, 207, 50, 44, 169, 106, 16,
          ]),
        ),
      },
    },
    claimAddress: {
      inner:
        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
    },
    rseed: 'RPuhZ9q2F3XHbTcDPRTHnJjJaMxv8hes4TzJuMbsA/k=',
  },
  position: '2383742304257',
  nullifier: { inner: 'dE7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  outputData: {
    delta1: {},
    delta2: { lo: '1000000' },
    lambda1: { lo: '2665239' },
    lambda2: {},
    unfilled1: {},
    unfilled2: {},
    height: '356591',
    tradingPair: {
      asset1: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
      asset2: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
    },
    epochStartingHeight: '356050',
  },
  source: {
    transaction: {
      id: '9e1OaxysQAzHUUKsroXMNRCzlPxd6hBWLrqURgNBrmE=',
    },
  },
});

const mockSwapAlternativeToken = SwapRecord.fromJson({
  swapCommitment: { inner: 'B6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
  swap: {
    tradingPair: {
      asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
      asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
    },
    delta1I: {},
    delta2I: { lo: '1000000' },
    claimFee: {
      amount: { hi: '0', lo: '0' },
      assetId: {
        inner: uint8ArrayToBase64(
          new Uint8Array([
            29, 109, 132, 171, 117, 25, 85, 32, 109, 182, 133, 48, 82, 47, 204, 82, 209, 59, 174,
            189, 148, 83, 191, 212, 31, 157, 52, 111, 42, 123, 56, 7,
          ]),
        ),
      },
    },
    claimAddress: {
      inner:
        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
    },
    rseed: 'RPuhZ9q2F3XHbTcDPRTHnJjJaMxv8hes4TzJuMbsA/k=',
  },
  position: '2383742304258',
  nullifier: { inner: 'eE7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  outputData: {
    delta1: {},
    delta2: { lo: '1000000' },
    lambda1: { lo: '2665239' },
    lambda2: {},
    unfilled1: {},
    unfilled2: {},
    height: '356591',
    tradingPair: {
      asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
      asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
    },
    epochStartingHeight: '356051',
  },
  source: {
    transaction: {
      id: '8e1OaxysQAzHUUKsroXMNRCzlPxd6hBWLrqURgNBrmE=',
    },
  },
});
