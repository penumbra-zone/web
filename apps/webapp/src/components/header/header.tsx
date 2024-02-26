import { TopRow } from './top-row';
import { SyncStatusSection } from './sync-status-section';

export const Header = () => {
  return (
    <header>
      <TopRow />
      <SyncStatusSection />
    </header>
  );
};
