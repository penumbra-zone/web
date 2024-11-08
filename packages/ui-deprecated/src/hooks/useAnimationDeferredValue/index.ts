import { useContext, useRef } from 'react';
import { IsAnimatingContext } from '../../utils/IsAnimatingContext';

/**
 * Use this hook just like you'd use React's `useDeferredValue()` hook, but for when
 * you want to defer a value update until an in-progress animation completes.
 *
 * ## When to use this
 *
 * When using framer-motion shared layout transitions (via the
 * `layout`/`layoutId` props), you may find that animations look janky because
 * the components being animated are updating with new data _while the animation
 * is still in progress_.
 *
 * For example, let's say you have a page with the user's assets, and a page
 * with the user's transactions. Those pages have elements with the same
 * `layoutId` so that, when the user navigates from the assets page to the
 * transactions page, the elements with the shared `layoutId` will transition
 * into each other when the route changes. But since you're just loading the
 * user's assets and transactions from a wallet extension, which stores that
 * data locally, the response will come back from the wallet so quickly that the
 * transactions page will start rerendering itself with the transaction data
 * that it's streaming from the wallet's response. This rerender happens _while
 * the transition animation is still in progress_. As a result, the animation
 * glitches, because suddenly the transactions page's layout has gotten taller
 * to accommodate the new data.
 *
 * This hook solves that problem by letting you defer rerendering until
 * animation has completed. Just like with `useDeferredValue()`, you pass a
 * value to `useAnimationDeferredValue()`, and then use the returned value from
 * the hook in your markup:
 *
 * ```tsx
 * const MyComponent = ({ liveUpdatingCollection }: MyComponentProps) => {
 *   const deferredLiveUpdatingCollection = useAnimationDeferredValue(liveUpdatingCollection);
 *
 *   return (
 *     <motion.div layoutId='someLayoutId'>
 *       {deferredLiveUpdatingCollection.map(item => (
 *         <div key={item.id}>{item.label}</div>
 *       ))}
 *     </motion.div>
 *   );
 * }
 * ```
 *
 * In the above example, if `<MyComponent />` is initially called with
 * `liveUpdatingCollection` equal to an empty array (`[]`), it will initially
 * render an empty `motion.div`. Then, if `liveUpdatingCollection` changes to
 * have values appended to it, but an animation is in progress in a parent
 * component*, `deferredLiveUpdatingCollection` won't change until the animation
 * has completed. Once the animation completes, `deferredLiveUpdatingCollection`
 * will be equal to the value of `liveUpdatingCollection` -- and will continue
 * to be equal to it for all subsequent updates to `liveUpdatingCollection` --
 * at least, until another parent animation starts.
 *
 * Note that this hook doesn't delay the _loading_ of the data, but rather just
 * the _rendering_ of it. Going back to the example of the assets and
 * transactions pages, let's say that loading the transactions data takes 100ms,
 * and rerendering the transactions page with the newly loaded data takes 20ms.
 * And let's say that the transition animation from the assets page to the
 * transactions page takes 125ms.
 *
 * First, here's the order of events if we do _not_ use
 * `useAnimationDeferredValue()`:
 * - 0ms: User clicks the Transactions link. The transition animation starts,
 * and transaction data starts loading.
 * - 100ms: The transaction data finishes loading, and the transactions page
 * begins rerendering with the newly loaded data. The animation is still in
 * progress.
 * - 120ms: The transactions page finishes rerendering with the newly loaded
 * data. This is when the glitch occurs in the animation: suddenly, the
 * transactions page got taller while it was still animating.
 * - 125ms: The animation finishes.
 *
 * Here's the order of events if we _do_ use `useAnimationDeferredValue()`:
 * - 0ms: User clicks the Transactions link. The transition animation starts.
 * - 100ms: Transaction data finishes loading.
 * - 125ms: The transition animation completes. The transactions page begins
 * rerendering with the loaded transaction data.
 * - 145ms: The transaction page finishes rerendering.
 *
 * As you can see, the only performance cost to using a deferred value is the
 * cost of _rendering_ that deferred value once it updates to the latest value.
 *
 * \* Note that the parent component must use `<IsAnimatingProvider />` to set
 * the context value that `useAnimationDeferredValue()` reads to determine
 * whether an animation is in progress.
 */
export const useAnimationDeferredValue = <ValueType>(value: ValueType) => {
  const valueRef = useRef(value);
  const isAnimating = useContext(IsAnimatingContext);

  if (isAnimating) {
    return valueRef.current;
  }

  valueRef.current = value;
  return value;
};
