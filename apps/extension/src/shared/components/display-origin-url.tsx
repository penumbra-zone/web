export const DisplayOriginURL = ({ url: { protocol, hostname, port } }: { url: URL }) => (
  <span className='font-mono'>
    <span className='tracking-[-0.1em] text-muted-foreground brightness-50'>
      {protocol}
      {'//'}
    </span>
    <span className='tracking-[-0.05em]'>{hostname}</span>
    {port ? (
      <span className='tracking-[-0.075em] text-muted-foreground brightness-75'>
        {':'}
        <span>{port}</span>
      </span>
    ) : null}
  </span>
);
