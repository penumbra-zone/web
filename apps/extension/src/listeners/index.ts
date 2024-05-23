import { penumbraRequestListener } from './penumbra-request';

chrome.runtime.onMessageExternal.addListener(penumbraRequestListener);
