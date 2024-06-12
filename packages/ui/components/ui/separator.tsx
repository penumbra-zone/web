/**
 * A simple horizontal dotted line with `flex-grow: 1` to be used in a flex
 * container.
 *
 * Make sure the flex container has `flex-align: center` applied to it.
 */
export const Separator = () => (
  // For some reason, Tailwind's ESLint config wants to change `border-b-[1px]`
  // to `border-b-DEFAULT`, even though that has a different effect!
  // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dashed border-light-brown' />
);
