import { TopRow } from './top-row';
import { SyncStatusSection } from './sync-status-section';

export const Header = () => {
  return (
    <header className='w-full overflow-hidden bg-gradient-to-t from-transparent to-black to-40% pb-[3em]'>
      {/* <SyncStatusSection /> */}
      <TopRow />
    </header>
  );
};
