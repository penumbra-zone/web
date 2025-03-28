import { PortfolioPage } from '@/pages/portfolio';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export default function Portfolio() {
  const headersList = headers();
  const { device } = userAgent({ headers: headersList });
  return <PortfolioPage isMobile={device.type === 'mobile'} />;
}
