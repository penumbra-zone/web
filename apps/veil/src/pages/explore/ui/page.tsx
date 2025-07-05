export const ExplorePage = async () => {
  return (
    <section className='mx-auto flex max-w-[1062px] flex-col gap-6 p-4'>
      <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
        <iframe
          className='absolute top-0 left-0 w-full h-full'
          src='https://www.youtube.com/embed/9t1IK_9apWs'
          title='indepednence day!!'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
      </div>
    </section>
  );
};
