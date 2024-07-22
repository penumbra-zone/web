import { createContext } from 'react';
import { Priority } from './utils/button';

/**
 * For internal Penumbra UI library use only. `<Button />`s should only ever be
 * of the `primary` priority, unless they are a secondary button in a
 * `<ButtonGroup />`.
 *
 * We don't want to expose a `priority` property on `<Button />`, because we
 * don't want engineers to ever manually assign `priority='secondary'`. So
 * instead, we'll create this context, which we'll set from inside `<ButtonGroup
 * />` and consume from inside `<Button />`.
 */
export const ButtonPriorityContext = createContext<Priority>('primary');
