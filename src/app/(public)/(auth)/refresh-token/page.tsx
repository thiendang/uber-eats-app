'use client'

import { toast } from '@/components/ui/use-toast'
import { checkAndRefreshToken, getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

const RefreshTokenPage = () => {
  // ** Search params
  const searchParams = useSearchParams()

  // ** Router
  const router = useRouter()

  // ** Get localstorage
  const refreshTokenFromLocalStorage = getRefreshTokenFromLocalStorage()
  // ** Get value searchParams
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const redirectPathname = searchParams.get('redirect')

  useEffect(() => {
    // Having refreshTokenFromUrl & RTFU === RTFL we will check and call refresh token
    if (refreshTokenFromUrl && refreshTokenFromUrl === refreshTokenFromLocalStorage) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || '/')
        }
      })
      // After refreshToken success then redirect user to home page
    }
  }, [router, refreshTokenFromUrl, redirectPathname])

  return <div>Refresh token...</div>
}

export default RefreshTokenPage
