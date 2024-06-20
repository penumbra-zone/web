import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalanceValueView } from '.';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

// Mocking the WalletIcon component
vi.mock('../icons/wallet', () => ({
  WalletIcon: ({ className }: { className: string }) => (
    <div data-testid='wallet-icon' className={className}></div>
  ),
}));

describe('<BalanceValueView />', () => {
  const penumbraMetadata = new Metadata({
    base: 'upenumbra',
    display: 'penumbra',
    symbol: 'UM',
    penumbraAssetId: {
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    },
    images: [
      {
        png: 'https://raw.githubusercontent.com/penumbra-zone/web/main/apps/minifront/public/favicon.png',
      },
    ],
    denomUnits: [
      {
        denom: 'penumbra',
        exponent: 6,
      },
      {
        denom: 'mpenumbra',
        exponent: 3,
      },
      {
        denom: 'upenumbra',
        exponent: 0,
      },
    ],
  });

  const valueView = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: {
          hi: 0n,
          lo: 123_456_789n,
        },
        metadata: penumbraMetadata,
      },
    },
  });

  test('renders value and wallet icon without cursor-pointer', () => {
    const { container } = render(<BalanceValueView valueView={valueView} />);

    expect(container).toHaveTextContent(`123.456789`);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
    const clickableElement = screen.getByTestId('wallet-icon').parentElement;
    expect(clickableElement).not.toHaveClass('cursor-pointer');
  });

  test('renders with cursor-pointer class', () => {
    const handleClick = vi.fn();
    const { container } = render(<BalanceValueView valueView={valueView} onClick={handleClick} />);

    expect(container).toHaveTextContent(`123.456789`);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
    const clickableElement = screen.getByTestId('wallet-icon').parentElement;
    expect(clickableElement).toHaveClass('cursor-pointer');
  });

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BalanceValueView valueView={valueView} onClick={handleClick} />);
    const clickableElement = screen.getByTestId('wallet-icon').parentElement!;

    fireEvent.click(clickableElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(valueView);
  });
});
