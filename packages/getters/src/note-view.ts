import { NoteView } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValue = createGetter((noteView?: NoteView) => noteView?.value);
export const getAddress = createGetter((noteView?: NoteView) => noteView?.address);
