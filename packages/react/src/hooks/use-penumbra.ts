import { useContext } from 'react';
import { penumbraContext } from '../context/penumbra-context.js';

export const usePenumbra = () => useContext(penumbraContext);
