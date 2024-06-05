import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { createGetter } from './utils/create-getter';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export const getValue = createGetter((noteView?: NoteView) => noteView?.value);
export const getAddress = createGetter((noteView?: NoteView) => noteView?.address);
export const getValueOpaque = createGetter((valueView?: ValueView) => valueView);
