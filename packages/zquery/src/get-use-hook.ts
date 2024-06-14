import { useEffect } from 'react';
import { CreateZQueryStreamingProps, CreateZQueryUnaryProps } from './types';
import { useShallow } from 'zustand/react/shallow';

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

  const useHook = (...args: FetchArgs) => {
    const useStore = props.getUseStore();

    useEffect(() => {
      const fetch = props.get(useStore.getState())._zQueryInternal.fetch;

      {
        const newReferenceCount = incrementReferenceCounter();

        if (newReferenceCount === 1) {
          setAbortController(new AbortController());
          void fetch(...args);
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

    const returnValue = useStore(
      useShallow(state => {
        const zQuery = props.get(state);

        return {
          data: zQuery.data,
          loading: zQuery.loading,
          error: zQuery.error,
        };
      }),
    );

    return returnValue;
  };

  return useHook;
};
