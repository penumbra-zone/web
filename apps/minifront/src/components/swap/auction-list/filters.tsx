import { ListFilter } from 'lucide-react';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { PopoverMenu, PopoverMenuItem } from '@repo/ui/components/ui/popover';
import type { Filter as TFilter } from '../../../state/swap/dutch-auction';

const filtersSelector = (state: AllSlices) => ({
  filter: state.swap.dutchAuction.filter,
  setFilter: state.swap.dutchAuction.setFilter,
});

const OPTIONS: PopoverMenuItem<TFilter>[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Upcoming',
    value: 'upcoming',
  },
  {
    label: 'All',
    value: 'all',
  },
];

export const Filters = () => {
  const { filter, setFilter } = useStoreShallow(filtersSelector);

  return (
    <PopoverMenu
      items={OPTIONS}
      value={filter}
      onChange={setFilter}
      trigger={<ListFilter size={16} />}
    />
  );
};
