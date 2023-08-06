export const Header = ({ text }: { text: string }) => {
  return (
    <h1 className='mx-auto text-center text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-8xl'>
      {text}
      <span className='from-brandred to-brandblue block bg-gradient-to-r bg-clip-text px-2 text-transparent'>
        In package
      </span>
    </h1>
  );
};
