import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  if (!req.cookies.has('nexa_access_token')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next|favicon).*)'],
};
