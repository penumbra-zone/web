import { ReactNode } from 'react';
import { ValidatorInfoContext } from './validator-info-context';
import { useValidatorInfos } from './use-validator-infos';

/**
 * Provides validator info loaded via a gRPC method.
 *
 * We use a React Context, rather than a route loader, because this is a
 * streaming method that may return dozens or even hundreds of results, and thus
 * could be very slow if we wait for the entire stream to end before rendering
 * anything (like a loader would do).
 */
export const ValidatorInfoProvider = ({ children }: { children: ReactNode }) => {
  const value = useValidatorInfos();

  return <ValidatorInfoContext.Provider value={value}>{children}</ValidatorInfoContext.Provider>;
};
