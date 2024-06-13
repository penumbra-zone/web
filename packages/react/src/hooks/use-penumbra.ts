import { useContext } from 'react';
import { penumbraContext } from '../penumbra-context';

export const usePenumbra = () => useContext(penumbraContext);
