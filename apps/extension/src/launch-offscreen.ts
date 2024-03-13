export const maybeStartRPC = async () => {
  try {
    const offscreenContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });
    if (offscreenContexts.length === 0)
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('penumbra-rpc.html'),
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'Local Penumbra RPC services',
      });
  } catch (e) {
    // failure is likely due to losing a creation race, which is ok.
    // TODO: suppress?  anything else possible?
    console.warn('Failed to create offscreen', e);
  }
};
