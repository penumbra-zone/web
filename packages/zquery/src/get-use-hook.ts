import { useEffect, useRef, useState } from 'react';
import {
  AbridgedZQueryState,
  CreateZQueryStreamingProps,
  CreateZQueryUnaryProps,
  UseHookOptions,
  ZQueryState,
} from './types.js';

const shallowCompareArrays = (a: unknown[], b: unknown[]): boolean =>
  a.every((item, index) => item === b[index]) && a.length === b.length;

/**
 * Returns a hook that can be used via `use[Name]()` to access the ZQuery state.
 */
export const getUseHook = <
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType = DataType,
>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
) => {
  const setAbortController = (abortController: AbortController | undefined) => {
    props.set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        abortController,
      },
    }));
  };

  const incrementReferenceCounter = () => {
    const newReferenceCount =
      props.get(props.getUseStore().getState())._zQueryInternal.referenceCount + 1;

    props.set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        referenceCount: newReferenceCount,
      },
    }));

    return newReferenceCount;
  };

  const decrementReferenceCounter = () => {
    const newReferenceCount =
      props.get(props.getUseStore().getState())._zQueryInternal.referenceCount - 1;

    props.set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        referenceCount: newReferenceCount,
      },
    }));

    return newReferenceCount;
  };

  const useHook = <
    SelectorReturnType,
    SelectorType extends
      | ((zQueryState: AbridgedZQueryState<ProcessedDataType | DataType>) => SelectorReturnType)
      | undefined,
  >(
    useHookOptions?: UseHookOptions<DataType | ProcessedDataType, SelectorType>,
    ...fetchArgs: FetchArgs
  ) => {
    const useStore = props.getUseStore();

    // We want to use a custom comparator to see if `fetchArgs` changed.
    // `useMemo()` does not support custom comparators, so we'll roll it ourself
    // using a combination of `useState` and `useEffect`.
    const [fetchArgsMemo, setFetchArgsMemo] = useState(fetchArgs);
    useEffect(() => {
      if (!shallowCompareArrays(fetchArgs, fetchArgsMemo)) {
        setFetchArgsMemo(fetchArgs);
      }
    }, [fetchArgs, fetchArgsMemo]);

    useEffect(() => {
      const fetch = props.get(useStore.getState())._zQueryInternal.fetch;

      const incrementedReferenceCount = incrementReferenceCounter();
      if (incrementedReferenceCount === 1) {
        setAbortController(new AbortController());
        void fetch(...fetchArgsMemo);
      }

      const onUnmount = () => {
        const decrementedReferenceCount = decrementReferenceCounter();
        if (decrementedReferenceCount === 0) {
          props.get(useStore.getState())._zQueryInternal.abortController?.abort();
          setAbortController(undefined);
        }
      };

      return onUnmount;
    }, [fetchArgsMemo, useStore]);

    const prevState = useRef<ZQueryState<DataType | ProcessedDataType, FetchArgs> | undefined>();
    const prevSelectedState = useRef<
      AbridgedZQueryState<ProcessedDataType | DataType> | SelectorReturnType
    >();

    const returnValue = useStore(state => {
      const newState: ZQueryState<DataType | ProcessedDataType, FetchArgs> = props.get(state);

      if (!Object.is(newState, prevState.current)) {
        const { data, loading, error } = newState;

        const shouldReselect =
          useHookOptions?.shouldReselect?.(prevState.current, newState) ?? true;

        if (useHookOptions?.select && shouldReselect) {
          prevSelectedState.current = useHookOptions.select({ data, loading, error });
        } else if (!useHookOptions?.select) {
          prevSelectedState.current = { data, loading, error };
        }
        prevState.current = newState;
      }

      return prevSelectedState.current;
    });

    return returnValue;
  };

  return useHook;
};
