import { SliceCreator } from '.';

export interface DefaultFrontendSlice {
  url?: string;
  setUrl: (url: string) => void;
}

export const createDefaultFrontendSlice = (): SliceCreator<DefaultFrontendSlice> => set => ({
  url: undefined,
  setUrl: url => {
    set(state => {
      state.defaultFrontend.url = url;
    });
  },
});
