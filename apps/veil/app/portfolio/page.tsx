import { PortfolioPage } from '@/pages/portfolio';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export default async function Portfolio() {
  const headersList = await headers();
  const { device } = userAgent({ headers: headersList });
  return <PortfolioPage isMobile={device.type === 'mobile'} />;
}
