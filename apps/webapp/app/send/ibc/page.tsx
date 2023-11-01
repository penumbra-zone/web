'use client';
import dynamic from 'next/dynamic';

const IbcForm = dynamic(() => import('./ibc-form'), {
  ssr: false,
});

export default function Page() {
  return <IbcForm />;
}
