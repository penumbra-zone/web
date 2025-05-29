import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { Density } from '../utils/density';

export interface AccountSelectorProps {
  /** The current account index */
  value: number;
  /** Called when the account index changes */
  onChange: (index: number) => void;
  /** Whether the previous button should be disabled */
  canGoPrevious?: boolean;
  /** Whether the next button should be disabled */
  canGoNext?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Function to get display value for account */
  getDisplayValue?: (index: number) => string;
  /** Label for the input */
  label?: string;
  /** Density for the navigation buttons */
  density?: Density;
}

/**
 * A component for selecting account indexes with navigation buttons.
 * Uses TextInput with endAdornment for iconOnly next/previous buttons.
 */
export const AccountSelector = ({
  value,
  onChange,
  canGoPrevious = true,
  canGoNext = true,
  disabled,
  getDisplayValue = index => `Account ${index}`,
  label,
}: AccountSelectorProps) => {
  const handlePrevious = () => {
    if (canGoPrevious && value > 0) {
      onChange(value - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onChange(value + 1);
    }
  };

  return (
    <TextInput
      type='text'
      value={getDisplayValue(value)}
      label={label}
      disabled={disabled}
      endAdornment={
        <div className='flex items-center gap-1'>
          <Button
            icon={ArrowLeft}
            iconOnly
            onClick={handlePrevious}
            disabled={disabled || !canGoPrevious || value === 0}
            actionType='default'
            priority='secondary'
            rounded
            density='compact'
          >
            Previous Account
          </Button>
          <Button
            icon={ArrowRight}
            iconOnly
            onClick={handleNext}
            disabled={disabled || !canGoNext}
            actionType='default'
            priority='secondary'
            rounded
            density='compact'
          >
            Next Account
          </Button>
        </div>
      }
    />
  );
};
