'use client';
import dynamic from 'next/dynamic';

const TransactionsTable = dynamic(() => import('./transaction-table'), {
  ssr: false,
});

export default function Page() {
  return <TransactionsTable />;
}
