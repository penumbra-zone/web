// Redirects "/" and "/trade" paths to paths defined in the routing middleware.
export const config = {
  matcher: ['/', '/trade'],
};

export { routingMiddleware as middleware } from '@/shared/index.server';
