import { SliceCreator } from './index';

export interface OnboardingSlice {
  plaintextPassword: string;
}

export const createOnboardingSlice: SliceCreator<OnboardingSlice> = () => {
  return {
    plaintextPassword: '',
  };
};
