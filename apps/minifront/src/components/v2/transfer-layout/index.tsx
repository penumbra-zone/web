import { Card } from '@repo/ui/Card';
import { Outlet, useNavigate } from 'react-router-dom';
import { Grid } from '@repo/ui/Grid';
import { Tabs } from '@repo/ui/Tabs';
import { usePagePath } from '../../../fetchers/page-path';
import { PagePath } from '../../metadata/paths';
import { motion } from 'framer-motion';

/** @todo: Remove this function and its uses after we switch to v2 layout */
const v2PathPrefix = (path: string) => `/v2${path}`;

const TABS_OPTIONS = [
  { label: 'Send', value: v2PathPrefix(PagePath.SEND) },
  { label: 'Receive', value: v2PathPrefix(PagePath.RECEIVE) },
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
              value={v2PathPrefix(pagePath)}
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
