import { Card } from '@repo/ui/Card';
import { Outlet, useNavigate } from 'react-router-dom';
import { Tabs } from '@repo/ui/Tabs';
import { usePagePath } from '../../../fetchers/page-path';
import { PagePath } from '../../metadata/paths';

/** @todo: Remove this function and its uses after we switch to v2 layout */
const v2PathPrefix = (path: string) => `/v2${path}`;

export const DashboardLayout = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <Card title='Asset Balances'>
      <Tabs
        value={v2PathPrefix(pagePath)}
        onChange={value => navigate(value)}
        options={[
          { label: 'Assets', value: v2PathPrefix(PagePath.DASHBOARD) },
          { label: 'Transactions', value: v2PathPrefix(PagePath.TRANSACTIONS) },
        ]}
        actionType='accent'
      />

      <Outlet />
    </Card>
  );
};
