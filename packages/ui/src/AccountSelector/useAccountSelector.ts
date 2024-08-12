import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccountSelectorProps } from '.';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

const MAX_INDEX = 2 ** 32;

/**
 * A hook that encapsulates the business logic of the `<AccountSelector />`
 * component.
 */
export const useAccountSelector = ({
  getAddressByIndex,
  filter,
  value,
  onChange,
}: AccountSelectorProps) => {
  const [uncontrolledIndex, setUncontrolledIndex] = useState<number>(0);
  const [ephemeral, setEphemeral] = useState<boolean>(false);
  const [address, setAddress] = useState<Address>();
  const [loading, setLoading] = useState(false);
  const sortedFilter = useMemo(() => (filter ? [...filter].sort() : undefined), [filter]);

  const isControlled = onChange !== undefined;

  const index = isControlled ? value : uncontrolledIndex;

  const handleChange = (newValue: number) => {
    if (isControlled) {
      onChange(newValue);
    } else {
      setUncontrolledIndex(newValue);
    }
  };

  const abortController = useRef(new AbortController());

  useEffect(() => {
    abortController.current.abort();

    if (!getAddressByIndex) {
      return;
    }

    const newAbortController = new AbortController();
    abortController.current = newAbortController;
    setLoading(true);

    void (async () => {
      const address = await getAddressByIndex(uncontrolledIndex, ephemeral);

      if (!newAbortController.signal.aborted) {
        setAddress(address);
        setLoading(false);
      }
    })();
  }, [uncontrolledIndex, ephemeral, getAddressByIndex]);

  const handleClickPrevious = () => {
    if (sortedFilter) {
      const previousAccount = sortedFilter[sortedFilter.indexOf(index) - 1];
      if (previousAccount !== undefined) {
        handleChange(previousAccount);
      }
    } else {
      handleChange(index - 1);
    }
  };

  const handleClickNext = () => {
    if (sortedFilter) {
      const nextAccount = sortedFilter[sortedFilter.indexOf(index) + 1];
      if (nextAccount !== undefined) {
        handleChange(nextAccount);
      }
    } else {
      handleChange(index + 1);
    }
  };

  const previousButtonEnabled = index !== 0 && (!sortedFilter || sortedFilter.indexOf(index) > 0);
  const nextButtonEnabled =
    index !== MAX_INDEX && (!sortedFilter || sortedFilter.indexOf(index) < sortedFilter.length - 1);

  return {
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
  };
};
