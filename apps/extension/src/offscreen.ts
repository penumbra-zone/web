import { offscreenMessageHandler } from './routes/offscreen/router';

chrome.runtime.onMessage.addListener(offscreenMessageHandler);