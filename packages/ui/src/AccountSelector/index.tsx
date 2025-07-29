import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { useDensity } from '../utils/density';

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
}

/**
 * A component for selecting account indexes with navigation buttons.
 * Uses TextInput with endAdornment for iconOnly next/previous buttons.
 *
 * The component automatically manages account navigation with proper boundary checks
 * and provides customizable display formatting through the `getDisplayValue` prop.
 *
 * Density variants are supported via the `useDensity()` hook. To control density,
 * wrap the component in a `<Density />` provider:
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AccountSelector
 *   value={currentAccount}
 *   onChange={setCurrentAccount}
 * />
 *
 * // With custom display formatting
 * <AccountSelector
 *   value={accountIndex}
 *   onChange={setAccountIndex}
 *   getDisplayValue={(index) => `Wallet ${index + 1}`}
 *   label="Select Account"
 * />
 *
 * // With density control
 * <Density compact>
 *   <AccountSelector
 *     value={currentAccount}
 *     onChange={setCurrentAccount}
 *     canGoNext={accountIndex < maxAccounts - 1}
 *     canGoPrevious={accountIndex > 0}
 *   />
 * </Density>
 * ```
 *
 * @param value - The current account index (0-based)
 * @param onChange - Callback fired when the account index changes
 * @param canGoPrevious - Whether navigation to previous account is allowed (defaults to true)
 * @param canGoNext - Whether navigation to next account is allowed (defaults to true)
 * @param disabled - Whether the entire component is disabled
 * @param getDisplayValue - Custom formatter for the display value (defaults to "Account {index}")
 * @param label - Optional label for the input field
 */
export const AccountSelector = ({
  value,
  onChange,
  canGoPrevious = true,
  canGoNext = true,
  disabled,
  getDisplayValue,
  label,
}: AccountSelectorProps) => {
  const density = useDensity();
  const displayValue = getDisplayValue ? getDisplayValue(value) : `Account ${value}`;

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
      value={displayValue}
      label={label}
      disabled={disabled}
      endAdornment={
        <div className='flex items-center gap-1'>
          <Button
            icon={ArrowLeft}
            iconOnly
            onClick={handlePrevious}
            disabled={(disabled ?? false) || !canGoPrevious || value === 0}
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
            disabled={(disabled ?? false) || !canGoNext}
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
