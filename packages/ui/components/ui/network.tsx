export interface NetworkProps {
  name: string;
  connectIndicator?: boolean;
}

export const Network = ({ name, connectIndicator = true }: NetworkProps) => {
  return (
    <div
      className={
        'flex items-center justify-between gap-4 rounded-lg border bg-background px-5 py-[7px] font-bold text-muted-foreground md:px-[25px] xl:px-[18px]'
      }
    >
      {connectIndicator && (
        <div className='-mx-1 h-4 w-1 rounded-sm bg-gradient-to-b from-cyan-400 to-emerald-400'></div>
      )}
      <p className='whitespace-nowrap'>{name}</p>
    </div>
  );
};
