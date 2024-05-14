export const grpcEndpoint = async (set?: URL): Promise<URL> => {
  if (set != null) await chrome.storage.local.set({ grpcEndpoint: String(set) });

  const { grpcEndpoint } = await chrome.storage.local.get('grpcEndpoint');
  if (typeof grpcEndpoint === 'string') return new URL(grpcEndpoint);

  throw TypeError();
};
