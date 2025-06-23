/**
 * A simple horizontal dotted line with `flex-grow: 1` to be used in a flex
 * container.
 *
 * Make sure the flex container has `flex-align: center` applied to it.
 */
export const Separator = () => (
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dotted border-light-brown' />
);
