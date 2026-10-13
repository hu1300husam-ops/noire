import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, API routes, and static files (anything with an extension).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
