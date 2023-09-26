import { beforeEach, describe, expect, test } from 'vitest';
import {
  base64ToUint8Array,
  IndexedDbInterface,
  NewNoteRecord,
  uint8ArrayToBase64,
} from 'penumbra-types';
import { BalancesReq, handleBalancesReq } from './balances';
import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { GrpcRequestTypename, INCOMING_GRPC_MESSAGE } from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

function assertOnlyUniqueAssetIds(responses: BalancesResponse[], accountId: number) {
  const account0Res = responses.filter(r => r.account?.account === accountId);
  const uniqueAssetIds = account0Res.reduce((collection, res) => {
    collection.add(
      res.balance?.assetId ? uint8ArrayToBase64(res.balance.assetId.inner) : undefined,
    );
    return collection;
  }, new Set());

  expect(account0Res.length).toBe(uniqueAssetIds.size);
}

describe('Balances request handler', () => {
  let indexedDb: IndexedDbInterface;
  let balRequest: BalancesRequest;
  let dappReq: BalancesReq;

  beforeEach(() => {
    indexedDb = {
      getAllNotes: (): Promise<NewNoteRecord[]> => Promise.resolve(testData),
    } as unknown as IndexedDbInterface;

    balRequest = new BalancesRequest({});
    dappReq = {
      type: INCOMING_GRPC_MESSAGE,
      serviceTypeName: ViewProtocolService.typeName,
      requestTypeName: balRequest.getType().typeName as GrpcRequestTypename<
        typeof ViewProtocolService
      >,
      requestMethod: balRequest,
      sequence: 0,
    };
  });

  test('aggregation, with no filtering', async () => {
    const responses: BalancesResponse[] = [];
    for await (const res of handleBalancesReq(dappReq, indexedDb)) {
      responses.push(res);
    }
    expect(responses.length).toBe(23);
    assertOnlyUniqueAssetIds(responses, 0);
    assertOnlyUniqueAssetIds(responses, 1);
    assertOnlyUniqueAssetIds(responses, 2);
    assertOnlyUniqueAssetIds(responses, 3);
  });

  test('filtering asset id', async () => {
    const assetIdStr = 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=';
    balRequest.assetIdFilter = new AssetId({
      inner: base64ToUint8Array(assetIdStr),
    });
    const responses: BalancesResponse[] = [];
    for await (const res of handleBalancesReq(dappReq, indexedDb)) {
      responses.push(res);
    }
    expect(responses.length).toBe(4);
    responses.forEach(r => {
      expect(uint8ArrayToBase64(r.balance!.assetId!.inner)).toBe(assetIdStr);
    });
  });

  test('filtering account', async () => {
    balRequest.accountFilter = new AddressIndex({ account: 3 });
    const responses: BalancesResponse[] = [];
    for await (const res of handleBalancesReq(dappReq, indexedDb)) {
      responses.push(res);
    }
    expect(responses.length).toBe(2);
    responses.forEach(r => {
      expect(r.account!.account).toBe(3);
    });
  });
});

const testData: NewNoteRecord[] = [
  {
    noteCommitment: {
      inner: '/WOhaj+mle7dd5x05pCETgOMhcl+jlndnm+fqv/mig8=',
    },
    note: {
      value: {
        amount: {
          lo: '986000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'TTFiLeSqznbSditmh4k+xQKgsyowJ+jz+R8LJXbrZG4=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'X5+vjqRRkp90oStmvMPTVEF+dTl3HgPqQ3zxloqdWgg=',
    },
    position: '919166844929',
    source: {
      inner: '+LpqtpN0IJt8zPPqKQoh8dJNRXCRpo7bQdKWYo3s+rM=',
    },
    heightSpent: 143632n,
  },
  {
    noteCommitment: {
      inner: '/ZHNLB1jeTEhpsvUl/KKNGsxIWoE2Xl/8JqQ2nFiMQ4=',
    },
    note: {
      value: {
        amount: {
          lo: '998000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'ajoCdXYxnMh4AISC8exwDtUzLMAkM1zYFIZKsj/jWIg=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'TkdXsriR4yYRvRCbVeh8Jakv+Ak5KlqcedK0wba+sQk=',
    },
    position: '803199713281',
    source: {
      inner: 'k9CKvPop92oRlyoA0oFybRYZbT6mCng1hwW/NpWSFH8=',
    },
    heightSpent: 126146n,
  },
  {
    noteCommitment: {
      inner: '/rajT2GvdTtpYzezvZIFOSV+UPsr0MhrIdlO5iDq7QI=',
    },
    note: {
      value: {
        amount: {
          lo: '3875820019684212736',
          hi: '54',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: 'UaMbR7oJoc5WnL9cQ6f5AEmIsRvfiKnU/qK8qTnFx88=',
      address: {
        inner:
          'w9zZkLDfn+o/7Q5NOZZCq3hYyKO+KNxYmTKlgatLiMQw3Nq9wiSyG2rQ7Q3PEd/M1D80DONRVx+BtM+YsutOpoqnNXpS80b2k07srFp9ZI4=',
      },
    },
    addressIndex: {
      account: 3,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'zFzjuz0p2V9i8xviMQARF2mGyLKxAojNqE0aXaW29wM=',
    },
    position: '69841',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: '0jytzSnVBF45IGPv3bvlaMXVjXoA6bzgPgnhgEkAWgk=',
    },
    note: {
      value: {
        amount: {
          lo: '999999',
        },
        assetId: {
          inner: 'ZLk9NvTSx7JanIy7vnMfdOYEsytfIk+F0sFUmFrrNgQ=',
        },
      },
      rseed: 'OnxVAlq4Gj+M4hzK/KJmoTIrE2w1B817+inNUnOlkq4=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'nzNew6+kRATjRWUgiTgfTGwWS9BgQ8LkdcEKdH+9aBA=',
    },
    position: '807476920320',
    source: {
      inner: 'BkWubo/Jm4EIVp+dBTXsOtoeVZJjciOPm94tpskUwBo=',
    },
  },
  {
    noteCommitment: {
      inner: '1PEFJxAkq0qVuh2M9/EVbv8M7iVI3tvxCppIzNUZzwE=',
    },
    note: {
      value: {
        amount: {
          lo: '1639813',
        },
        assetId: {
          inner: 'CjvDEg4HE30fnoU+H5m23kvl3mW54Y+NcBCFXZ6MjA4=',
        },
      },
      rseed: 'JffijBP0Cosu8Qh70f48hg8CyZXUjRfuAfsfMnHj89A=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'tckdVKrKBkLiiM9voXs4+ZsH7+aqqq32BgBrdBHkPwI=',
    },
    position: '807459553280',
    source: {
      inner: 'Twa/fRgZ1xDEVXc1c1pVAPDijGh0TGbb1cgRrWadtL0=',
    },
  },
  {
    noteCommitment: {
      inner: '2iaXj8iC6YdnWiYuIpsapJo2WDNETGZsVNyKrKosuAQ=',
    },
    note: {
      value: {
        amount: {
          lo: '958709',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: 'z5KCwDR0f/WIKBy08hfmQJXCL23Qk5J8X/rPg/RR8zY=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '7TklIpWlM7wl3DEPikyoEIT45JklmnYvnUVDJWAkUwA=',
    },
    position: '614211715072',
    source: {
      inner: 'PRbkQb15G6WQnbzA/1ZHTGNZnrpOAldKxGQcR9ZvG5M=',
    },
    heightSpent: 126001n,
  },
  {
    noteCommitment: {
      inner: '2zVPIOshBGDxbtCm5kaUHT4du7hDEc+96T1cmLubgwY=',
    },
    note: {
      value: {
        amount: {
          lo: '999000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'rvqMI3ehxCM6fEZCaAeWhskCvSyH+k/9nZhBE+THXzA=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'G4G+XnlzoupT0aqS7tqoKlqqE+v8IngsEF+9U2s6zRE=',
    },
    position: '614211715073',
    source: {
      inner: 'PRbkQb15G6WQnbzA/1ZHTGNZnrpOAldKxGQcR9ZvG5M=',
    },
    heightSpent: 125974n,
  },
  {
    noteCommitment: {
      inner: '4g4A9aUrU9wsXMKU+TZMBs6s8FqSnUzvxMEuJBvmqAw=',
    },
    note: {
      value: {
        amount: {
          lo: '942350',
        },
        assetId: {
          inner: 'fCskpkVsZ7GwkUBdc+FyM8f5VMGQNp/+uV4bl3SyYg8=',
        },
      },
      rseed: 'bnt1YyKs0PwvAnfedxaakFwsolIkk/PZzmO8jZm1b/Q=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'AbNk5P6w95S4xTihqu78XFIAD3gy2Dv25bYsstPogA4=',
    },
    position: '919166844928',
    source: {
      inner: '+LpqtpN0IJt8zPPqKQoh8dJNRXCRpo7bQdKWYo3s+rM=',
    },
  },
  {
    noteCommitment: {
      inner: '90lrwEib57/Od5kUm953l8VHXyp+xq1io3IOPhlkFwc=',
    },
    note: {
      value: {
        amount: {
          lo: '615000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'eu6uEw2zlYAp2MtplGSmbxDWIu9WcuEWpfEPPiwZCAE=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'UVuMA+Pk/7pFppC93nA2QYewE/MwqRWrx2aA2mBRfQA=',
    },
    position: '919168679937',
    source: {
      inner: 'kW3NQeomzl4XzX43SnQu15TC6FEidFj/rSclHRaH/gk=',
    },
  },
  {
    noteCommitment: {
      inner: '9N178IGvjbF/hX8cTwfhoUiT+Me24xUFFhdWdjQWUwk=',
    },
    note: {
      value: {
        amount: {
          lo: '976000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'sUh5ZhD2XyntY/etoogdwHXHZ6naMV7NbCk1loubTgQ=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'pQMf+Yw1Vx7SBotfgLSN0Q3fHxaX+bH0h5MmvxrKYAA=',
    },
    position: '923417968641',
    source: {
      inner: 'XsPzQi9o8G8DtzP1hKMRlgumIJT9wn44br5ndfjacTU=',
    },
  },
  {
    noteCommitment: {
      inner: 'B0alv5KOcjIZja7gKSnrgkoQXvGllIiZBy8ZXTnUEQ8=',
    },
    note: {
      value: {
        amount: {
          lo: '1000000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'yAYRLur6izbvM7FEc12smOTOEFISdUb8v2OkJUYD+sw=',
      address: {
        inner:
          'R/TypBowpYBONxRwMkHKg+dlxi/5L9BV8RL2PcSERBDbfWXhkwejLXB1AgQ0tT8yr0r7IFW/pSvAeKnTN2xxliVFOa4Kncwg08OmYz2XfFU=',
      },
    },
    addressIndex: {
      account: 1,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'W59k5oD90i5iATWGQxYFxW8dra2aEtkvgWBZRXop/wY=',
    },
    position: '71846',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'BUDFLL6jNNSUxBGlbEar5mltMR8TxvUa3WrlW1OIsAg=',
    },
    note: {
      value: {
        amount: {
          lo: '987000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'xEgyaK/wxKGntS7Z4nEtDk2zjWnwX6PMc0Fxt2Witu0=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'JdzTeqW/Ewyrv+T0iXLum2xhEef8Dg/l+KS1DZITzQI=',
    },
    position: '807475412993',
    source: {
      inner: 'fO1rgN5WuONHhCsbUPWLfeOFp3dzRKWuOqP0QINAScM=',
    },
    heightSpent: 143582n,
  },
  {
    noteCommitment: {
      inner: 'CBIBGIGLunz12EIIiIMzznaS9l9YLYww6GLwxBnz2gM=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: 'EygLsfV8+qVQ+cGvglTShshKyY4NjiaFmzyq4Dsmaws=',
        },
      },
      rseed: 'ol6MV2CvnUPDfxOu4LdtG/IdHnDbyhvoyioo3r8wc+o=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'uQxdbQhtzrvnp0Tsfn3pqaOWRH1F7gT10s6EKDSD4Qc=',
    },
    position: '919168679936',
    source: {
      inner: 'kW3NQeomzl4XzX43SnQu15TC6FEidFj/rSclHRaH/gk=',
    },
    heightSpent: 143649n,
  },
  {
    noteCommitment: {
      inner: 'DRjTzcGjgYQGtA+AMhv0AYjl2ytCbQMbQ//UeIakowc=',
    },
    note: {
      value: {
        amount: {
          lo: '646000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'PcSaczlP3pSx92eUno1Q6OtCw58nPT0y35t8kEzYpx4=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'ho96jGlZI7pFCqQg4a8/wZ6kpIOco/43KATxZvaorQk=',
    },
    position: '635660337153',
    source: {
      inner: '9hfh/Wnp35YBd6Uc+TiWwlp6ASYYJXFE7KAhCZmGL7I=',
    },
    heightSpent: 125982n,
  },
  {
    noteCommitment: {
      inner: 'Ez3FuXMdQIet74k4/KTEyiY1sudFOIigwRWCCuGlqQM=',
    },
    note: {
      value: {
        amount: {
          lo: '1551237',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: 'aDIN/NlezdnTCS8fbFW62bptZc0hYRKQXai4kRjFBzY=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'lrW1U6yg3YcI4a1Tti5I9VUwomKFHx4xUaVA0TI2XAs=',
    },
    position: '807459553281',
    source: {
      inner: 'Twa/fRgZ1xDEVXc1c1pVAPDijGh0TGbb1cgRrWadtL0=',
    },
    heightSpent: 126295n,
  },
  {
    noteCommitment: {
      inner: 'J14agtaLbk620tKiXWWDXHIzMdCjMWvyrMaXx39OJAA=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: 'Rtk3BI8JWd13ADkOdDlxkG6x3u0LFs0vEx0JEk5pjAU=',
        },
      },
      rseed: 'lGFwDx4KYNjn5F1rT1O1rKZNBaUNm8f0zYR++saamvI=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'f18wZPbcoewFabQkwyypUQyToQOcBqv1z3MgC38uKQM=',
    },
    position: '807458832384',
    source: {
      inner: 'O8s8krdfUbsr/53W4yh0FWazrFuy4XJAHA4eFPup8SM=',
    },
  },
  {
    noteCommitment: {
      inner: 'KHwMSJiTcBHLkkhh8ZiEDpnbRi80hcv6xQMnK8i/ggU=',
    },
    note: {
      value: {
        amount: {
          lo: '945983',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: 'abNHUO3BQ4lExSGkbsd9pviuk0w1zwRBY89mHVh77uM=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'xS7yMjJtENS10BRfLfqhdWLLJfZc5EG1s+6f5OWWjQM=',
    },
    position: '807475412992',
    source: {
      inner: 'fO1rgN5WuONHhCsbUPWLfeOFp3dzRKWuOqP0QINAScM=',
    },
    heightSpent: 126422n,
  },
  {
    noteCommitment: {
      inner: 'KIaQru1Ca31UO5lknhLp3Z5/fbsBCbyiSvCVHYX0PAk=',
    },
    note: {
      value: {
        amount: {
          lo: '988000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'cYNywFenIO509A5X/RnVW5pz3Dy8daqEHGl/Q5B9xWI=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '4HEePKdLIEkgG5Sxoxlpny52nYRKZNrh/1KVG6tFXwE=',
    },
    position: '807458832385',
    source: {
      inner: 'O8s8krdfUbsr/53W4yh0FWazrFuy4XJAHA4eFPup8SM=',
    },
    heightSpent: 126399n,
  },
  {
    noteCommitment: {
      inner: 'MtJVU6kkh/0/O9jCb45ROtLMaD1BFwXk7haGd2nKrw0=',
    },
    note: {
      value: {
        amount: {
          lo: '3875820019684212736',
          hi: '54',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: 'Hlk87+Uhq47pk8iYBwwMuU9UQ2e5wEqUO1Q+gDcHIWA=',
      address: {
        inner:
          'R/TypBowpYBONxRwMkHKg+dlxi/5L9BV8RL2PcSERBDbfWXhkwejLXB1AgQ0tT8yr0r7IFW/pSvAeKnTN2xxliVFOa4Kncwg08OmYz2XfFU=',
      },
    },
    addressIndex: {
      account: 1,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '0CsP3h9+xbNJd7kH0YdWl3pCvbGFNy0MF95b3XiuvwA=',
    },
    position: '71847',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'NhuKe1mnWM3t4gm1oDWOTTxpl50Jbxn0CW6tjKG5FAg=',
    },
    note: {
      value: {
        amount: {
          lo: '1000000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'L1weF8SiMIaWi5M1Xdeo8OBQvvm4M/9Gpsqni0jd5VI=',
      address: {
        inner:
          'glCaFj2Oq3yCF3KA8bI+5/4k+0z6hOSfDCQ/qvXQZtLSd3YvvZ7wrmNZGncwD5ep/mUK1yescxRPAMqXk2T/WkGeE3ToRk1tbRJARLow9aI=',
      },
    },
    addressIndex: {
      account: 2,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'NlnZvXV2CPFd5FQJ4FdZlZD5BON7EG61UqhB0NAFPAU=',
    },
    position: '76088',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'QQwh7g9m3JbV/1Igwb28IhGQmUd1mWwhim/fksBC1A0=',
    },
    note: {
      value: {
        amount: {
          lo: '100000000',
        },
        assetId: {
          inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
        },
      },
      rseed: 'WPPjvH5NO6uaPnDAV1SlujL6+y87ShlhGj4gFV9B5CU=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'z72bA6UpAmjiz1ftZsQVKmFF2c0kx+ChkIl0m5tgAQM=',
    },
    position: '65554',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'QtVEJGWzg36CNm6S4xnIu+3Xx3/U5gjw2CP49QZF2wE=',
    },
    note: {
      value: {
        amount: {
          lo: '625000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'QfBn3ZWIcR35AjI644Mtyr9YPbGB//lqeavZOUymVuo=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'CcNmmkwz1goNmnnxm/cdkP6Yih9AIBoQWf9NXEZxFQg=',
    },
    position: '807476330497',
    source: {
      inner: 'htQV5I//pSztSF1C/AqSUjL+QIx/R7kX6XIDRyXSvSQ=',
    },
    heightSpent: 143610n,
  },
  {
    noteCommitment: {
      inner: 'T7BCRV/A9JRyxFrp+HwyxbF/tb+S/2oqw1JhyfbbnAI=',
    },
    note: {
      value: {
        amount: {
          lo: '1000000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: '8r31VPSxi3v6mrFS6H8K8v5Jyijcb4SpA/UJSv1nCX4=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'jdMzdhdrSvPoWCyA0/3GI5fenneRPUI2QvpQQgKicwk=',
    },
    position: '66872',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'TQ8ZXi00CgWO82Gvrnp+SSDU4pW+tF5KPwQau1RHtQA=',
    },
    note: {
      value: {
        amount: {
          lo: '3875820019684212736',
          hi: '54',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: 'b2bi73e58XDILtKl2i+3NvHBkwglD70Q94DtiKbqnXI=',
      address: {
        inner:
          'glCaFj2Oq3yCF3KA8bI+5/4k+0z6hOSfDCQ/qvXQZtLSd3YvvZ7wrmNZGncwD5ep/mUK1yescxRPAMqXk2T/WkGeE3ToRk1tbRJARLow9aI=',
      },
    },
    addressIndex: {
      account: 2,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'DD1oSoFfn6whMAajB7aRT508/keuxUh6RfB9aK1RkwA=',
    },
    position: '76089',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'TzualO94wuXbtJg+Lq3ZTHoXhQ8FacVqk7mkPAHfYgs=',
    },
    note: {
      value: {
        amount: {
          lo: '1373822',
        },
        assetId: {
          inner: 'uhSz/kFSc+AVTzJVE/szNPMOyFbQUMhg/q3u3Ns8ABE=',
        },
      },
      rseed: 'eG7U9FDu7nde4E4ZZTp75g7MkPVRELvIuOZwctJVFN0=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'tNhd8r1/AtQYjsPP86V9DFkJXHorAgf2e1BHw8ecXgM=',
    },
    position: '803201482753',
    source: {
      inner: 'nJA0edSWt+dHzHr1orA2s6e6VCY7JkNLhLhQaN8GYqk=',
    },
  },
  {
    noteCommitment: {
      inner: 'Vu8DETzfpWX5as4yVG1JhjOcXYqMca/u7xbUvalwdg8=',
    },
    note: {
      value: {
        amount: {
          lo: '1639813',
        },
        assetId: {
          inner: 'ZLk9NvTSx7JanIy7vnMfdOYEsytfIk+F0sFUmFrrNgQ=',
        },
      },
      rseed: 'Gc07lFcWohEqbxOBVe4WIkq31hegsf8lMfuaOuxKxjU=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'cwWHdQaG5Wjxi5f3b3L+9tGZpGJWkoRAlfRPN8/phQM=',
    },
    position: '807468597251',
    source: {
      inner: '5A/wZpX3AlCXzRdOHyrgyKI8HA7QjC+ltPlWD3iQg2Y=',
    },
  },
  {
    noteCommitment: {
      inner: 'YE2VoydD4fheCqJ3XtS0Hn+F5ecCidl8ruqY20EVBwA=',
    },
    note: {
      value: {
        amount: {
          lo: '1000000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'thU0E2vY6Tej7pm2+uJCYKscOpMIgOkSzEDPRvSQBqQ=',
      address: {
        inner:
          'w9zZkLDfn+o/7Q5NOZZCq3hYyKO+KNxYmTKlgatLiMQw3Nq9wiSyG2rQ7Q3PEd/M1D80DONRVx+BtM+YsutOpoqnNXpS80b2k07srFp9ZI4=',
      },
    },
    addressIndex: {
      account: 3,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'l/+oCMBOKov0XBS7f9ghhmU4INCDVT+n5liIop05kA0=',
    },
    position: '69840',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'aCEPxkIQ1h+h5GxwuPLdG9IYanhcOO4F3BPe6zGYZRI=',
    },
    note: {
      value: {
        amount: {
          lo: '999999',
        },
        assetId: {
          inner: 'iMv99UR/tJOEtUpJn4hlssIAbNtHbPAfgaOD1gKVuA4=',
        },
      },
      rseed: 'CkZgOP4wWS/hB8oPi4BzjFp7mwXgDvMucJoPljD1Nes=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'MOtXBWhl4L8ZLVF6e3qncIktSPGF/X9lBoCzEFxPkxI=',
    },
    position: '807477248000',
    source: {
      inner: 'FkaGARFTps8VfHEZN/cLjh2ZDC819dG68sjI79AtBEY=',
    },
  },
  {
    noteCommitment: {
      inner: 'bOXLqv/moPouqdtlB4GzY5IEJ9Av4gH9YC+egaE2qAE=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: 'dgl5J/FdAJ6uUTYTi07yKhfI6Cu6BEuxgd+todqjIQo=',
        },
      },
      rseed: 'YgyW2K8bEVwptYnKrKknO4xRwz9TC/31192ICFPTk0M=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'H4cWEDsjZWeoqkU/ZDcV58bYQIhtRz+GQuFaV7DOYws=',
    },
    position: '807476330496',
    source: {
      inner: 'htQV5I//pSztSF1C/AqSUjL+QIx/R7kX6XIDRyXSvSQ=',
    },
  },
  {
    noteCommitment: {
      inner: 'gSUyR0IvaPe0mHTuWrIBXh0YuQLREaIiYTKGIsZZiww=',
    },
    note: {
      value: {
        amount: {
          lo: '635000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'iBxAAUv/SDvls/kJ0eTFUyzpMJoSqxiD0slSGh2cc5I=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '5Fhdt3GM8ESmU5NAR3XZdLH+Sq8Og2OobKLvMRdmrg8=',
    },
    position: '807472594944',
    source: {
      inner: 'Nq/5ctrTnlY2Ty7/6q79ml/yfxHni9N5b+0vAadpU6A=',
    },
    heightSpent: 126413n,
  },
  {
    noteCommitment: {
      inner: 'ik33GA+vHE6z4jcPw9QI2Xife7SoUhKTMq/UbpLShAM=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: '0J+gRzUuTrEJy9AcpcybPOXffU/ZmUEzJwEI8mUBnBA=',
        },
      },
      rseed: 'MPDNvA0QRx4Ez+SNFi5yULanN9Q0DmQDIoAyBCUNUqE=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '3dXScyZSBQoHm0KB9Js1QjgR939vBwE4QEQGHaFZJAY=',
    },
    position: '923419082752',
    source: {
      inner: 'Nwtzrv6L96jM4RWgS+unITk/xza85QuTwCRSu+QW6+I=',
    },
  },
  {
    noteCommitment: {
      inner: 'mLHVRTaICvtxicVuNe3RfvoaTtSduvGEK5GZMEQXUwQ=',
    },
    note: {
      value: {
        amount: {
          lo: '88000000',
        },
        assetId: {
          inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=',
        },
      },
      rseed: 'J7RqfL+usa4PcqNX3b8QvcUchE46g+lKs9jMe/gK4So=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'GI46eI/7JRJB9d+atjPCnQsXJ7PHAj/0JKe+5bTDZAM=',
    },
    position: '635660861441',
    source: {
      inner: 'Op2+/6Si3RPoy0neBRrPJCQij1/VK9vPw1KqwbYTMuU=',
    },
  },
  {
    noteCommitment: {
      inner: 'nZJG+IEe50NrCmBm4oRVdYzI12RnB9UlwC/pbDNskgM=',
    },
    note: {
      value: {
        amount: {
          lo: '946264',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: '7RcAgV09bn9Ujg2Xskmt2VSfroqK1NbFq0RRQE8HlFM=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'GQD+mtX0Vg4qZUE63zo8xIbra5a/sdK9Xg3L38V40wE=',
    },
    position: '803200237568',
    source: {
      inner: 'AbVQE5CbbcaxQSNJoVamjmMKTMYMDYDhS2Z7Uthh8sw=',
    },
    heightSpent: 126157n,
  },
  {
    noteCommitment: {
      inner: 'nmOIRoDoSj5F7pYx5z2OG25On8X2kmdfsko3M5rBYg8=',
    },
    note: {
      value: {
        amount: {
          lo: '3875820019684212736',
          hi: '54',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: 'AaKuGo/ZlJ0lTHqj1D39zh9T7HRjDURP8XV4937IqRU=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'R0iB6Dum9jDRb6K+KkYUVvzDUWozNLG+A34MMq152AM=',
    },
    position: '66873',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'oD/gimJzY+Sibz19ERwvhM4i/YMs4GhVGMbbz3DReQU=',
    },
    note: {
      value: {
        amount: {
          lo: '1001882102603448320',
          hi: '27105',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: '78CYHBgQbxFq10fZp8KMJTJMv0/W8h/9CG4b+mpbr2M=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'upxKW/xzY3+p9RBduyXmWdAPl2g18tWu5+iqlqqNcwc=',
    },
    position: '65556',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'oIsnMIijmTml+W+brdnuY3zM3vPDkKh4eRUNVekPSAo=',
    },
    note: {
      value: {
        amount: {
          lo: '1000000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: '654csQGRQuRO4iunc2QyGiw2+8OeZCmLYJiK5CGbXY4=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'sQpY8gWW53CvCo1CQzgYQ2wNKRfTDb0mswelp7fdnwo=',
    },
    position: '65553',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
  {
    noteCommitment: {
      inner: 'r3L1ayXYt5vpZvW2A8gv4bbZF5zNSaQLBqWzUyXYoQU=',
    },
    note: {
      value: {
        amount: {
          lo: '15572806156628787200',
          hi: '27050',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: 'bpfhVIokuTV+Msx0rHBc34hSb3VwjALDRWz2MlYjv/k=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'wbqVekM6LtYewVwe6FWIC5DXqdMqVIOQclEm8a9Jrws=',
    },
    position: '635660599297',
    source: {
      inner: 'UKfWSer2kKwxV5Gt7sI3L9SyJY9hllLbw0Oi62QRTLA=',
    },
  },
  {
    noteCommitment: {
      inner: 'rMrRx/NbLvNiVP7Tow4vHwstiQdY0xYCevC0joKU6AE=',
    },
    note: {
      value: {
        amount: {
          lo: '946264',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: 'ZzeyGEubPi9arukGmV29AFMesi+DgaPFU16dtdvOQTQ=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'kuDPzievwxGMzP/hsN0AUmEkMRZozNFxSGkQejkSEQY=',
    },
    position: '803199713280',
    source: {
      inner: 'k9CKvPop92oRlyoA0oFybRYZbT6mCng1hwW/NpWSFH8=',
    },
    heightSpent: 126001n,
  },
  {
    noteCommitment: {
      inner: 't86+d9XZh/ycJOTlPEHu541Z8cxR8ttJiQYPGbQWdw0=',
    },
    note: {
      value: {
        amount: {
          lo: '100',
        },
        assetId: {
          inner: 'nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw=',
        },
      },
      rseed: 'aH2ue/QxXQmr91Un6mXTl2OBbxRRTrP162jsZxzpv1Q=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: '3Z1BB0XauzEleOnrcVKLu2fkZzr87AhM9KKPA9Th4Ac=',
    },
    position: '635655946240',
    source: {
      inner: 'DktbYZ9pHZwoPnAHIRWo3j/5k0/bs7bkIerJpJ6J+Ks=',
    },
  },
  {
    noteCommitment: {
      inner: 'tTmObzCN+vvfe7zek5wSbTpS57rplXZCq3HciGU8Qw0=',
    },
    note: {
      value: {
        amount: {
          lo: '645000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'IDssG87eqerTnNy+OqcfMZlf5pwiWda5BD6HZJf6ulk=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'jQOgvNuP9vjLTAqO8bgkizUFAAmWjAZnvE7YSlDnsA8=',
    },
    position: '803200237569',
    source: {
      inner: 'AbVQE5CbbcaxQSNJoVamjmMKTMYMDYDhS2Z7Uthh8sw=',
    },
    heightSpent: 126356n,
  },
  {
    noteCommitment: {
      inner: 'tiUK6nRPPLCpoqGMe6WwbFptSU8/4M0TCKiwr+XHWA0=',
    },
    note: {
      value: {
        amount: {
          lo: '604973',
        },
        assetId: {
          inner: '/U15sF9pOR1XG8ZWWTp0npW5cZ2O64OaQ0Cuf+SUjg8=',
        },
      },
      rseed: 'vqInktPD0+J7SCl+mKjGVr4b5fl3oRhgqe5wrAAvk34=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'giZ5cy1fpMujRkyW8Jm8Iawqgwu2pqwT+dw4qEoW9Qg=',
    },
    position: '803201482752',
    source: {
      inner: 'nJA0edSWt+dHzHr1orA2s6e6VCY7JkNLhLhQaN8GYqk=',
    },
    heightSpent: 126157n,
  },
  {
    noteCommitment: {
      inner: 'vblaUzXXpBj+Ig17+iLEAsxKsO1hK5ZhybWexzRP3gg=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: '6C2lIULs8/JaBpSQm79nx+VrPF4pN9Oizn9/ZyCKkBI=',
        },
      },
      rseed: 'X5Cx85AE0o+tpxbcOkNxa18SJkm0cBX29tUI5r0p0E0=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'v+/9BeddfvXk8QtBopQTwK6rHzBCvUQ/UK0o1TXaVAM=',
    },
    position: '807472594945',
    source: {
      inner: 'Nq/5ctrTnlY2Ty7/6q79ml/yfxHni9N5b+0vAadpU6A=',
    },
  },
  {
    noteCommitment: {
      inner: 'wmOFSQGyVj29jVt1mBlaGA7aQaNIcchU2mDMnhXNmgE=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: 'GPLlDsFd/2lWZjjXg/Cmllcda6SjlaAtKFZHJWUIqwo=',
        },
      },
      rseed: '6AeDnPrXBdqr2Z3iLMg2z+xg+O1MyWYZ0dVVuXErb1o=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'gCT8kI41ETkRhL8BuY4BPosqTANgfZd/nh+f28Rt9g8=',
    },
    position: '923417968640',
    source: {
      inner: 'XsPzQi9o8G8DtzP1hKMRlgumIJT9wn44br5ndfjacTU=',
    },
  },
  {
    noteCommitment: {
      inner: 'zsqwWkpZPHNVHHvq/pF1sRrOt6JRxMhqQOJ6sqy0XRI=',
    },
    note: {
      value: {
        amount: {
          lo: '1',
        },
        assetId: {
          inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
        },
      },
      rseed: 'pz0dxIOuW13Ming20FZ+b5rcKWUy60ZxaJjrYFeDSAU=',
      address: {
        inner:
          'iy702TEFgS7gO6FQqPE56WdOQrTNQ0vq6yHYj0RqWdFPxsSfWn9x8y5H1CY3vZFrgzRl5oArDqljap8FAgu4VyH/8bm1uvkqyrXKliZumFI=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'smiXApEIiFQZkD9pdaZR63C7u7RSMdnOj7BNx9KnqgU=',
    },
    position: '65555',
    source: {
      inner: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
    },
  },
];
