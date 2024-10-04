import type { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TextInput } from '../TextInput';
import { styled } from 'styled-components';
import { body } from '../utils/typography';
import { Density } from '../Density';
import { Button } from '../Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AccountSelectorAddress } from './AccountSelectorAddress';
import { IbcDepositToggle } from './IbcDepositToggle';
import { useAccountSelector } from './useAccountSelector';
import { useRef } from 'react';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(2)};
`;

const StartAdornment = styled.div`
  ${body}

  color: ${props => props.theme.color.text.secondary};
  cursor: pointer;
`;

const EndAdornment = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  padding: ${props => props.theme.spacing(2)} 0;
`;

const MAX_INDEX = 2 ** 32;

interface ControlledProps {
  /**
   * The current account index.
   *
   * Leave this undefined if you want to use `<AccountSelector />` as an
   * uncontrolled component.
   */
  value: number;
  /**
   * The account index the user is changing to.
   *
   * Leave this undefined if you want to use `<AccountSelector />` as an
   * uncontrolled component.
   */
  onChange: (index: number) => void;
}

interface UncontrolledProps {
  value?: undefined;
  onChange?: undefined;
}

export type AccountSelectorProps = {
  /**
   * A possibly async function that, when given an address index (and a boolean
   * indicating whether the address should be ephemeral), returns an `Address`.
   *
   * If left undefined, no address will be rendered.
   */
  getAddressByIndex?: (index: number, ephemeral: boolean) => Promise<Address> | Address;
  /**
   * An array of address indexes to switch between, if you want to limit the
   * options. No need to sort them, as the component will do that for you.
   */
  filter?: number[];
} & (ControlledProps | UncontrolledProps);

/**
 * Allows users to navigate between their accounts, either for viewing their
 * addresses, or for toggling between accounts to control an account-based view.
 *
 * Can be used as either a controlled or uncontrolled component. To use as a
 * controlled component, pass the `value` and `onChange` props. To use as an
 * uncontrolled component (for when, e.g., you just want to enable a user to
 * page through their account addresses, but doing so won't affect anything else
 * on the page), leave those props undefined.
 */
export const AccountSelector = (props: AccountSelectorProps) => {
  const {
    index,
    handleChange,
    handleClickPrevious,
    previousButtonEnabled,
    handleClickNext,
    nextButtonEnabled,
    address,
    ephemeral,
    setEphemeral,
    loading,
  } = useAccountSelector(props);

  const textInputRef = useRef<HTMLInputElement>(null);
  const onClickStartAdornment = () => textInputRef.current?.focus();

  return (
    <Root>
      <TextInput
        type='number'
        value={index.toString()}
        min={0}
        max={MAX_INDEX}
        ref={textInputRef}
        onChange={value => {
          /**
           * Don't allow manual account number entry when there's a
           * filter.
           *
           * @todo: Change this to only call `handleChange()` when the
           * user presses Enter? Then it could validate that the entered
           * account index is in the filter.
           */
          if (props.filter) {
            return;
          }
          const valueAsNumber = Number(value);
          const valueLength = value.replace(/^0+/, '').length;

          if (valueAsNumber > MAX_INDEX || valueLength > MAX_INDEX.toString().length) {
            return;
          }

          handleChange(valueAsNumber);
        }}
        startAdornment={
          <StartAdornment
            role='button'
            aria-label='Focus on the account number input'
            onClick={onClickStartAdornment}
          >
            Account #
          </StartAdornment>
        }
        endAdornment={
          <EndAdornment>
            <Density density='compact'>
              <Button
                icon={ArrowLeft}
                iconOnly
                priority='secondary'
                onClick={handleClickPrevious}
                disabled={!previousButtonEnabled}
              >
                Previous
              </Button>
              <Button
                icon={ArrowRight}
                iconOnly
                priority='secondary'
                onClick={handleClickNext}
                disabled={!nextButtonEnabled}
              >
                Next
              </Button>
            </Density>
          </EndAdornment>
        }
      />

      {props.getAddressByIndex && (
        <>
          <AccountSelectorAddress address={address} ephemeral={ephemeral} loading={loading} />
          <IbcDepositToggle value={ephemeral} onChange={setEphemeral} />
        </>
      )}
    </Root>
  );
};
