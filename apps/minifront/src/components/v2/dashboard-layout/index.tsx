import { Card } from '@repo/ui/Card';
import { Outlet, useNavigate } from 'react-router-dom';
import { Grid } from '@repo/ui/Grid';
import { Tabs } from '@repo/ui/Tabs';
import { usePagePath } from '../../../fetchers/page-path';
import { PagePath } from '../../metadata/paths';

/** @todo: Remove this function and its uses after we switch to v2 layout */
const v2PathPrefix = (path: string) => `/v2${path}`;

const CARD_TITLE_BY_PATH = {
  [v2PathPrefix(PagePath.DASHBOARD)]: 'Asset Balances',
  [v2PathPrefix(PagePath.TRANSACTIONS)]: 'Transaction List',
};

export const DashboardLayout = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <Grid container>
      <Grid mobile={0} tablet={2} desktop={3} xl={4} />

      <Grid tablet={8} desktop={6} xl={4}>
        <Card title={CARD_TITLE_BY_PATH[v2PathPrefix(pagePath)]}>
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
      </Grid>

      <Grid mobile={0} tablet={2} desktop={3} xl={4} />
    </Grid>
  );
};
