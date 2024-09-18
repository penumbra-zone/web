import { MotionProps } from 'framer-motion';

/**
 * Utility interface for components that accept a `motion` prop, so that they
 * can spread it onto a framer-motion component.
 *
 * Includes a JSDoc-style comment over the `motion` prop so that consumers of
 * your component have documentation for the prop.
 *
 * @example
 * ```tsx
 * export interface MyComponentProps extends MotionProp {
 *   children?: ReactNode;
 * }
 *
 * export const MyComponent = ({ children, motion }: MyComponentProps) => (
 *   <motion.div {...motion}>{children}</motion.div>
 * )
 * ```
 */
export interface MotionProp {
  /**
   * Any framer-motion props you wish to pass to this component to animate it or
   * do shared layout transitions.
   */
  motion?: MotionProps;
}
