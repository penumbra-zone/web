const Receive = () => {
  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    ></form>
  );
};

export default Receive;
