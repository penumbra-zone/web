const defaultFrontendUrl = new URL(DEFAULT_FRONTEND_URL).origin;

export const frontendUrl = async (set?: URL): Promise<URL> => {
  if (set != null) await chrome.storage.local.set({ frontendUrl: String(set) });

  const { frontendUrl = defaultFrontendUrl } = await chrome.storage.local.get('frontEndUrl');
  if (typeof frontendUrl === 'string') return new URL(frontendUrl);

  throw TypeError();
};
