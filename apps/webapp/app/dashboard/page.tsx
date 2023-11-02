'use client';

import dynamic from 'next/dynamic';

const AssetsTable = dynamic(() => import('./assets-table'), {
  ssr: false,
});

export default function Page() {
  return <AssetsTable />;
}
