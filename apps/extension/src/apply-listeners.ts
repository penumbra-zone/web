import { praxTabInit } from './listeners/tab-init';
import { praxRequestListener } from './listeners/origin-request';

if (EXTERNAL) chrome.runtime.onMessageExternal.addListener(praxRequestListener);

chrome.tabs.onUpdated.addListener(praxTabInit);
chrome.runtime.onMessage.addListener(praxRequestListener);
