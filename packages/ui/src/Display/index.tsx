import { ReactNode } from 'react';

export interface DisplayProps {
  children?: ReactNode;
}

/**
 * Wrap your top-level component for a given page (usually a `<Grid />`) in
 * `<Diplay />` to adhere to PenumbraUI guidelines regarding maximum layouts
 * widths, horizontal margins, etc.
 *
 * ```tsx
 * <Display>
 *   <Grid container>
 *     <Grid tablet={6}>Column one</Grid>
 *     <Grid tablet={6}>Column two</Grid>
 *   </Grid>
 * </Display>
 * ```
 */
export const Display = ({ children }: DisplayProps) => {
  return (
    <section className='flex flex-col items-center justify-start px-4 py-0 desktop:px-8'>
      <div className='flex w-full max-w-screen-xl flex-col items-center justify-start'>
        {children}
      </div>
    </section>
  );
};
