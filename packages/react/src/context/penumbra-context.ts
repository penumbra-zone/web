import { PenumbraClient } from '@penumbra-zone/client/client';
import { createContext } from 'react';

export const penumbraContext = createContext(new PenumbraClient());
