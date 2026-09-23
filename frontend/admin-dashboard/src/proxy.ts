import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  if (!req.cookies.has('nexa_access_token')) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
