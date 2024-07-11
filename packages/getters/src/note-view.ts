import { NoteView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getValue = createGetter((noteView?: NoteView) => noteView?.value);
export const getAddress = createGetter((noteView?: NoteView) => noteView?.address);
