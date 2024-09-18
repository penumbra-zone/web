import { Card } from '@penumbra-zone/ui/Card';
import { Outlet, useNavigate } from 'react-router-dom';
import { Grid } from '@penumbra-zone/ui/Grid';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { usePagePath } from '../../../fetchers/page-path';
import { PagePath } from '../../metadata/paths';
import { AssetsCardTitle } from './assets-card-title';
import { TransactionsCardTitle } from './transactions-card-title';
import { motion } from 'framer-motion';
import { getV2Link } from '../get-v2-link.ts';

const CARD_TITLE_BY_PATH = {
  [getV2Link(PagePath.DASHBOARD)]: <AssetsCardTitle />,
  [getV2Link(PagePath.TRANSACTIONS)]: <TransactionsCardTitle />,
};

const TABS_OPTIONS = [
  { label: 'Assets', value: getV2Link(PagePath.DASHBOARD) },
  { label: 'Transactions', value: getV2Link(PagePath.TRANSACTIONS) },
];

export const DashboardLayout = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <Grid container>
      <Grid mobile={0} tablet={2} desktop={3} xl={4} />

      <Grid tablet={8} desktop={6} xl={4}>
        <Card
          title={CARD_TITLE_BY_PATH[getV2Link(pagePath)]}
          motion={{ layout: true, layoutId: 'main' }}
        >
          <motion.div layout>
            <Tabs
              value={getV2Link(pagePath)}
              onChange={value => navigate(value)}
              options={TABS_OPTIONS}
              actionType='accent'
            />
          </motion.div>

          <Outlet />
        </Card>
      </Grid>

      <Grid mobile={0} tablet={2} desktop={3} xl={4} />
    </Grid>
  );
};
