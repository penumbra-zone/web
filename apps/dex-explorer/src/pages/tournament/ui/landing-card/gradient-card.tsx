export const GradientCard = ({ children }: { children: React.ReactNode }) => (
  <div className='relative p-[1px]'>
    <div className='absolute z-10 top-0 left-0 bottom-0 right-0 rounded-xl [background:linear-gradient(110deg,rgba(186,77,20,1),rgba(186,77,20,0),rgba(34,99,98,0),rgba(34,99,98,1))]' />
    <div className='absolute z-20 top-1 left-1 bottom-1 right-1 rounded-xl bg-base-blackAlt' />
    <div className='relative z-30 flex flex-col gap-4 rounded-xl p-3 backdrop-blur-lg [background:linear-gradient(110deg,rgba(186,77,20,0.2)_0%,rgba(34,99,98,0.1)_75%)]'>
      {children}
    </div>
  </div>
);
