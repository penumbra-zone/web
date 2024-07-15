import { useContext } from 'react';
import { penumbraContext } from '../penumbra-context.js';

export const usePenumbra = () => useContext(penumbraContext);
