const sw = self as unknown as ServiceWorkerGlobalScope;

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// https://bugs.chromium.org/p/chromium/issues/detail?id=1219164
// TODO: Comment
export const handleOffscreen = async <T>(promise: Promise<T>): Promise<Awaited<T>> => {
  if (!(await offscreenDocCreated())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'Spawn web workers',
    });
  }
  const result = await promise;
  await closeOffscreenDocument();
  return result;
};

const closeOffscreenDocument = async () => {
  if (!(await offscreenDocCreated())) {
    return;
  }
  await chrome.offscreen.closeDocument();
};

// Check all windows controlled by the service worker if one of them is the offscreen document
const offscreenDocCreated = async () => {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const matchedClients = await sw.clients.matchAll();

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true;
    }
  }
  return false;
};
