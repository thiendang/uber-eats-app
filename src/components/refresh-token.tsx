'use client'

import {
  checkAndRefreshToken,
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

    // Run once immediately (so we don't wait for the first interval)
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval)
      }
    })

    // Then keep checking every 1 second
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)

    // Cleanup when component unmounts (e.g. when navigating away)
    return () => clearInterval(interval)
  }, [pathname])

  return null
}

export default RefreshToken
