// Redirects "/" and "/trade" paths to "/trade/:primary/:numeraire"
export const config = {
  matcher: ['/', '/trade'],
};

export { tradeMiddleware as middleware } from '@/pages/trade/index.server';
