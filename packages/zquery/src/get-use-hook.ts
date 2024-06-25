import { useEffect, useRef } from 'react';
import {
  CreateZQueryStreamingProps,
  CreateZQueryUnaryProps,
  UseHookProps,
  ZQueryState,
} from './types';

const objectsAreNotEqual = (before: unknown, after: unknown) => !Object.is(before, after);

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
      | ((
          zQueryState: Pick<
            ZQueryState<DataType | ProcessedDataType, FetchArgs>,
            'data' | 'error' | 'loading'
          >,
        ) => SelectorReturnType)
      | undefined,
  >(
    useHookProps?: UseHookProps<
      DataType | ProcessedDataType,
      FetchArgs,
      SelectorReturnType,
      SelectorType
    >,
    ...fetchArgs: FetchArgs
  ) => {
    const useStore = props.getUseStore();

    useEffect(() => {
      const fetch = props.get(useStore.getState())._zQueryInternal.fetch;

      {
        const newReferenceCount = incrementReferenceCounter();

        if (newReferenceCount === 1) {
          setAbortController(new AbortController());
          void fetch(...fetchArgs);
        }
      }

      const onUnmount = () => {
        const newReferenceCount = decrementReferenceCounter();

        if (newReferenceCount === 0) {
          props.get(useStore.getState())._zQueryInternal.abortController?.abort();
          setAbortController(undefined);
        }
      };

      return onUnmount;
    }, [fetch]);

    const prevState = useRef<ZQueryState<DataType | ProcessedDataType, FetchArgs> | undefined>();
    const prevSelectedState =
      useRef<
        SelectorType extends undefined
          ? { data?: ProcessedDataType | DataType; error: unknown; loading: boolean }
          : ReturnType<NonNullable<SelectorType>>
      >();

    const returnValue = useStore(state => {
      const newState: ZQueryState<DataType | ProcessedDataType, FetchArgs> = props.get(state);

      if (objectsAreNotEqual(newState, prevState.current)) {
        const { data, loading, error } = newState;

        if (
          useHookProps?.select &&
          (!useHookProps.shouldReselect || useHookProps.shouldReselect(prevState.current, newState))
        ) {
          prevSelectedState.current = useHookProps.select({ data, loading, error });
        } else if (useHookProps?.select === undefined) {
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
