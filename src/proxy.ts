import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;
  const daimonToken = request.cookies.get('daimon_token')?.value;

  const pathname = request.nextUrl.pathname;

  // Protect /daimon routes (except /daimon/login)
  if (pathname.startsWith('/daimon') && !pathname.startsWith('/daimon/login')) {
    if (!daimonToken) {
      return NextResponse.redirect(new URL('/daimon/login', request.url));
    }
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!adminToken && !daimonToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/daimon/:path*'],
};
