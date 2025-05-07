import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const privatePaths = ['/manage']
const unAuthPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Example pathname: /manage/dashboard
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // If not logged in, deny access to private paths
  // Note: We are not handling accessToken expiration here, so we shouldn't include accessToken in this check.
  // If we did, it would incorrectly treat expired AT as a full logout scenario.
  // At this stage, we only check for the existence of refreshToken to determine login status.
  // If refreshToken is missing, the user is considered not logged in.
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user is already logged in, prevent access to login page
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
    const url = new URL('/logout', request.url)
    url.searchParams.set('refreshToken', request.cookies.get('refreshToken')?.value ?? '')
    return NextResponse.redirect(url)
  }

  // Case: User is logged in, but accessToken is missing (likely expired)
  // Since refreshToken handling (e.g., refreshing accessToken) isn't implemented yet,
  // we log the user out if accessToken is missing even though refreshToken exists
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL('/logout', request.url)
    url.searchParams.set('refreshToken', refreshToken ?? '')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// This middleware will apply to the following paths
export const config = {
  matcher: ['/manage/:path*', '/login']
}