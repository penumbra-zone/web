import { BuildActionFn } from '@penumbra-zone/router';
import { offscreenControl } from '../control/offscreen';

export const buildAction: BuildActionFn = offscreenControl.buildAction;
