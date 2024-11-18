import { useContext } from 'react';
import { IsAnimatingContext } from '../../utils/IsAnimatingContext';

export const useIsAnimating = () => useContext(IsAnimatingContext);
