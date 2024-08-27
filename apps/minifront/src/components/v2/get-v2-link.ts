import type { PagePath } from '../metadata/paths.ts';

/** @todo: Remove this function and its uses after we switch to v2 layout */
export const getV2Link = (path: PagePath) => `/v2${path}`;
