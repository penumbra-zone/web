import { useIbcBalancesNew } from './hooks';

export const AssetsTable = () => {
  const { data, isLoading, error } = useIbcBalancesNew();
  console.log(data);

  return <div>your assets</div>;
};
