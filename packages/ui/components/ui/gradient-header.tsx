/**
 * A header with text whose color is a gradient of brand colors.
 */
export const GradientHeader = ({ children }: { children: string }) => (
  <p className='bg-text-linear bg-clip-text font-headline text-xl font-semibold leading-[30px] text-transparent md:text-2xl md:font-bold md:leading-9'>
    {children}
  </p>
);
