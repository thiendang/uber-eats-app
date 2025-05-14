'use client'

import { useAppContext } from '@/components/app-provider'
import { toast } from '@/components/ui/use-toast'
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

const LogoutLogic = () => {
  const { mutateAsync } = useLogoutMutation()
  const searchParams = useSearchParams()
  const { setIsAuth } = useAppContext()

  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  const refreshTokenFromLocalStorage = getRefreshTokenFromLocalStorage()
  const accessTokenFromLocalStorage = getAccessTokenFromLocalStorage()

  const router = useRouter()
  const ref = useRef<any>(null)

  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl && refreshTokenFromUrl !== refreshTokenFromLocalStorage) ||
        (accessTokenFromUrl && accessTokenFromUrl !== accessTokenFromLocalStorage))
    ) {
      ref.current = mutateAsync
      mutateAsync()
        .then((res) => {
          // console.log({ res })
          const messageResult = res.payload.message

          setTimeout(() => {
            ref.current = null
          }, 1000)

          toast({
            description: messageResult
          })

          setIsAuth(false)

          // localStorage.removeItem('accessToken')
          // localStorage.removeItem('refreshToken')
          router.push('/login')
          // router.refresh()
        })
        .catch((err) => {
          console.log('error', err)
        })
        .finally(() => {})
    } else {
      router.push('/')
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl])

  return <div>Log out...</div>
}

const LogoutPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogoutLogic />
    </Suspense>
  )
}

export default LogoutPage
