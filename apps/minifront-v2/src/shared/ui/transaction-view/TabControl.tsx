import React from 'react';
import { Text } from '@penumbra-zone/ui/Text';

// Copied from TransactionView.tsx
export enum TxViewTab {
  MY_VIEW = 'my',
  PUBLIC_VIEW = 'public',
  RECEIVER_VIEW = 'receiver',
}

export const TAB_OPTIONS = [
  { value: TxViewTab.MY_VIEW, label: 'My View' },
  { value: TxViewTab.RECEIVER_VIEW, label: 'Receiver View' },
  { value: TxViewTab.PUBLIC_VIEW, label: 'Public View' },
];

export interface TabControlProps {
  value: string; // Consider using TxViewTab type here for stricter type checking
  onChange: (value: string) => void; // Consider using TxViewTab type here
  options: {
    value: string; // Consider using TxViewTab type here
    label: string;
  }[];
}

export const TabControl: React.FC<TabControlProps> = ({ value, onChange, options }) => {
  const getButtonClassName = (optionValue: string, isActive: boolean): string => {
    if (isActive) {
      if (optionValue === 'my') {
        return 'bg-primary-main text-white';
      }
      if (optionValue === 'receiver') {
        return 'bg-other-tonal-fill5 text-white';
      }
      return 'bg-unshield-main text-white'; // Default for 'public' or other active tabs
    }
    return 'bg-black/20 text-white/70 hover:bg-black/30';
  };

  return (
    <div className='flex overflow-hidden rounded-full border border-other-tonal-stroke'>
      {options.map(option => (
        <button
          key={option.value}
          className={`flex-1 whitespace-nowrap px-4 py-2 text-center transition-colors ${getButtonClassName(
            option.value,
            value === option.value,
          )}`}
          onClick={() => onChange(option.value)}
        >
          <Text variant='body'>{option.label}</Text>
        </button>
      ))}
    </div>
  );
};
