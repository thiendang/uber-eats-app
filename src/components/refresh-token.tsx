'use client'

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'

// These paths do NOT require refresh token behavior
const UNAUTHENTICATED_PATH = ['/login', '/register', '/refresh-token']

const RefreshToken = () => {
  const pathname = usePathname()

  useEffect(() => {
    // If current path is unauthenticated, do nothing
    if (UNAUTHENTICATED_PATH.includes(pathname)) return

    let interval: any = null

    // This function checks and refreshes the token if needed
    const checkAndRefreshToken = async () => {
      const accessToken = getAccessTokenFromLocalStorage()
      const refreshToken = getRefreshTokenFromLocalStorage()

      // If no token exists (not logged in), exit early
      if (!accessToken || !refreshToken) return

      const decodedAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
      const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number; iat: number }

      // Get current time in seconds
      const now = Math.round(Date.now() / 1000)

      // If refresh token is expired, exit early
      if (decodedRefreshToken.exp <= now) return

      // If the access token is within the last 1/3 of its lifespan, refresh it
      const accessTokenLifespan = decodedAccessToken.exp - decodedAccessToken.iat
      const remainingTime = decodedAccessToken.exp - now
      const isAboutToExpire = remainingTime < accessTokenLifespan / 3

      if (isAboutToExpire) {
        try {
          const { payload } = await authApiRequest.refreshToken()
          setAccessTokenToLocalStorage(payload.data.accessToken)
          setRefreshTokenToLocalStorage(payload.data.refreshToken)
        } catch (error) {
          // If refresh fails (e.g. 401), logout is handled elsewhere,
          // just stop the interval here
          clearInterval(interval)
        }
      }
    }

    // Run once immediately (so we don't wait for the first interval)
    checkAndRefreshToken()

    // Then keep checking every 1 second
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)

    // Cleanup when component unmounts (e.g. when navigating away)
    return () => clearInterval(interval)
  }, [pathname])

  return null
}

export default RefreshToken
