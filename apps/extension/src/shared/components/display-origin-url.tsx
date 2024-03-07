export const DisplayOriginURL = ({ url: { protocol, hostname, port } }: { url: URL }) => (
  <span className='font-mono'>
    <span className='inline-block tracking-[-0.1em] brightness-90 saturate-50'>
      {protocol}
      {'//'}
    </span>
    <span className='tracking-[-0.05em] brightness-150 saturate-150'>{hostname}</span>
    {port ? (
      <>
        <span className='inline-block tracking-[-0.075em]  brightness-90 saturate-50'> {':'} </span>
        <span className='tracking-[-0.05em] brightness-150 saturate-150'>{port}</span>
      </>
    ) : null}
  </span>
);
