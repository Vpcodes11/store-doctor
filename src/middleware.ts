import { NextRequest, NextResponse } from 'next/server';

/**
 * The admin dashboard and admin APIs are for you (the operator) only.
 * Protected with HTTP Basic auth: any username, password = ADMIN_PASSWORD.
 * Without ADMIN_PASSWORD set they are closed entirely.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const header = req.headers.get('authorization') || '';
  if (password && header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(':') + 1);
      if (given.length === password.length && timingSafeEqual(given, password)) return NextResponse.next();
    } catch {
      /* malformed header */
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="StoreDoctor admin", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
