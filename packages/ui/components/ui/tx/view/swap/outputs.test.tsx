import { describe, expect, it } from 'vitest';
import { Outputs } from './outputs';
import { render } from '@testing-library/react';
import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';

const output1 = NoteView.fromJson({
  value: {
    knownAssetId: {
      amount: {
        lo: '20',
        hi: '0',
      },
      metadata: {
        description: '',
        denomUnits: [
          {
            denom: 'pizza',
            exponent: 0,
            aliases: [],
          },
        ],
        base: 'pizza',
        display: 'pizza',
        name: '',
        symbol: 'PIZZA',
        penumbraAssetId: {
          inner: 'nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw=',
          altBech32m: '',
          altBaseDenom: '',
        },
        images: [],
      },
      equivalentValues: [],
    },
  },
  rseed: 'zh7uSysaA3kxPSmo+OazhLGhC6bcXbK0ji+lSo5ouwA=',
  address: {
    decoded: {
      address: {
        inner:
          '4fKCsU36MxI3yJWbuYpRBxiHEU+vMjJ9/BGDKQezql1pOaffx2ClKc6Zx2cgebzpxHf8peB3LSZrblwyKneOVF9+J64F8CI0+48eeYuWpUg=',
        altBech32m: '',
      },
      index: {
        account: 0,
        randomizer: '',
      },
      walletId: {
        inner: 'EUxHzpLc2HhyxRUwM7q9cW5y8VnYOPbvTh0NCd5Pjwk=',
      },
    },
  },
});

const output2 = NoteView.fromJson({
  value: {
    knownAssetId: {
      amount: {
        lo: '0',
        hi: '0',
      },
      metadata: {
        description: '',
        denomUnits: [
          {
            denom: 'penumbra',
            exponent: 6,
            aliases: [],
          },
          {
            denom: 'mpenumbra',
            exponent: 3,
            aliases: [],
          },
          {
            denom: 'upenumbra',
            exponent: 0,
            aliases: [],
          },
        ],
        base: 'upenumbra',
        display: 'penumbra',
        name: '',
        symbol: 'UM',
        penumbraAssetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
          altBech32m: '',
          altBaseDenom: '',
        },
        images: [],
      },
      equivalentValues: [],
    },
  },
  rseed: 'hlGD1yypLswH2bqpwB0ZMrwKpyKy5znyLMvhP5+jEAI=',
  address: {
    decoded: {
      address: {
        inner:
          '4fKCsU36MxI3yJWbuYpRBxiHEU+vMjJ9/BGDKQezql1pOaffx2ClKc6Zx2cgebzpxHf8peB3LSZrblwyKneOVF9+J64F8CI0+48eeYuWpUg=',
        altBech32m: '',
      },
      index: {
        account: 0,
        randomizer: '',
      },
      walletId: {
        inner: 'EUxHzpLc2HhyxRUwM7q9cW5y8VnYOPbvTh0NCd5Pjwk=',
      },
    },
  },
});

describe('<Outputs />', () => {
  it('renders nothing if `output1` is undefined', () => {
    const { container } = render(<Outputs output2={output2} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if `output1.value` is undefined', () => {
    const { container } = render(<Outputs output1={new NoteView()} output2={output2} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if `output2` is undefined', () => {
    const { container } = render(<Outputs output1={output1} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if `output2.value` is undefined', () => {
    const { container } = render(<Outputs output1={output1} output2={new NoteView()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
