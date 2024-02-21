import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { createGetter } from './utils/create-getter';

export const getValueView = createGetter((noteView?: NoteView) => noteView?.value);
