export const GradientCard = ({ children }: { children: React.ReactNode }) => (
  <div className='relative p-px'>
    <div className='absolute top-0 right-0 bottom-0 left-0 z-10 rounded-xl [background:linear-gradient(110deg,rgba(186,77,20,1),rgba(186,77,20,0),rgba(34,99,98,0),rgba(34,99,98,1))]' />
    <div className='absolute top-1 right-1 bottom-1 left-1 z-20 rounded-xl bg-base-black-alt' />
    <div className='relative z-30 flex flex-col gap-4 rounded-xl p-3 backdrop-blur-lg [background:linear-gradient(110deg,rgba(186,77,20,0.2)_0%,rgba(34,99,98,0.1)_75%)]'>
      {children}
    </div>
  </div>
);
