import { Card } from '@repo/ui/Card';
import { Outlet, useNavigate } from 'react-router-dom';
import { Grid } from '@repo/ui/Grid';
import { Tabs } from '@repo/ui/Tabs';
import { usePagePath } from '../../../fetchers/page-path';
import { PagePath } from '../../metadata/paths';
import { motion } from 'framer-motion';
import { getV2Link } from '../get-v2-link.ts';

const TABS_OPTIONS = [
  { label: 'Send', value: getV2Link(PagePath.SEND) },
  { label: 'Receive', value: getV2Link(PagePath.RECEIVE) },
];

export const TransferLayout = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <Grid container>
      <Grid mobile={0} tablet={2} desktop={3} xl={4} />

      <Grid tablet={8} desktop={6} xl={4}>
        <Card title='Transfer Assets' motion={{ layout: true, layoutId: 'main' }}>
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
