import { AuthorizeAndBuildRequest, WitnessAndBuildRequest } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb";
import { offscreenClient } from "./types";
import { WitnessData } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb";

const sw = self as unknown as ServiceWorkerGlobalScope;

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

export const handleOffscreen = async (
  req: WitnessAndBuildRequest, 
  witness: WitnessData, 
  fullViewingKey: string, 
  action_types: string[]
): Promise<void> => {
  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'Spawn web workers',
    });
  }
  
  const result = await offscreenClient.buildAction(req, witness, fullViewingKey, action_types)
  if ('error' in result) throw result.error;
  if (!result.data) throw new Error('Transaction was not approved');
  closeOffscreenDocument()
};

async function closeOffscreenDocument() {
    if (!(await hasDocument())) {
      return;
    }
    await chrome.offscreen.closeDocument();
  }

async function hasDocument() {
    // Check all windows controlled by the service worker if one of them is the offscreen document
    const matchedClients = await sw.clients.matchAll();
    for (const client of matchedClients) {
      if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
        return true;
      }
    }
    return false;
  }