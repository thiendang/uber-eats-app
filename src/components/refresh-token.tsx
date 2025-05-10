'use client'

import {
  checkAndRefreshToken,
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import jwt from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'
import { toast } from '@/components/ui/use-toast'

// These paths do NOT require refresh token behavior
const UNAUTHENTICATED_PATH = ['/login', '/register', '/refresh-token']

const RefreshToken = () => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // If current path is unauthenticated, do nothing
    if (UNAUTHENTICATED_PATH.includes(pathname)) return

    let interval: any = null

    // Run once immediately (so we don't wait for the first interval)
    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval)
        toast({
          description: 'Hết phiên đăng nhập!!'
        })
        router.push('/login')
      }
    })

    // Then keep checking every 1 second
    const TIMEOUT = 1000
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval)
            toast({
              description: 'Hết phiên đăng nhập!!'
            })
            router.push('/login')
          }
        }),
      TIMEOUT
    )

    // Cleanup when component unmounts (e.g. when navigating away)
    return () => clearInterval(interval)
  }, [pathname, router])

  return null
}

export default RefreshToken
