import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Si el dominio es sesiones-informativas-winston.vercel.app
  if (hostname.includes('sesiones-informativas-winston')) {
    // Si está en la raíz, redirigir a /sesiones
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/sesiones', request.url));
    }
  }
  
  // Si el dominio es taller-ia-winston.vercel.app
  if (hostname.includes('taller-ia-winston')) {
    // Si está en la raíz, redirigir a /taller-ia
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/taller-ia', request.url));
    }
  }
  
  // Si es el dominio de open-house y está en /sesiones o /taller-ia, redirigir a /
  if (hostname.includes('open-house-chi')) {
    if (request.nextUrl.pathname === '/sesiones') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (request.nextUrl.pathname === '/taller-ia') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

