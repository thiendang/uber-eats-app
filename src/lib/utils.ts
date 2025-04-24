import { toast } from '@/components/ui/use-toast'
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { jwtDecode } from 'jwt-decode'
import authApiRequest from '@/apiRequests/auth'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import envConfig, { defaultLocale } from '@/config'
import { TokenPayload } from '@/types/jwt.types'
import guestApiRequest from '@/apiRequests/guest'
import { format } from 'date-fns'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'
import { io } from 'socket.io-client'
import slugify from 'slugify'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove `/`
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    toast({
      title: 'Error',
      description: error?.payload?.message ?? 'Something went wrong!',
      variant: 'destructive',
      duration: duration ?? 5000
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('accessToken') : null

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem('refreshToken') : null
export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('accessToken', value)

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('refreshToken', value)
export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem('accessToken')
  isBrowser && localStorage.removeItem('refreshToken')
}

export const checkAndRefreshToken = async (param?: {
  onError?: () => void
  onSuccess?: () => void
  force?: boolean
}) => {
  // You should NOT extract the logic of retrieving access and refresh tokens outside this function `checkAndRefreshToken`
  // Because each time checkAndRefreshToken() is called, we want to get fresh access and refresh tokens
  // This avoids the bug where old tokens (fetched on the first call) are reused for subsequent calls
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()

  // If not logged in, skip execution
  if (!accessToken || !refreshToken) return

  const decodedAccessToken = decodeToken(accessToken)
  const decodedRefreshToken = decodeToken(refreshToken)

  // Token expiration time is in epoch time (seconds)
  // While new Date().getTime() returns epoch time in milliseconds
  const now = Math.round(new Date().getTime() / 1000)

  // If the refresh token has expired, remove tokens and trigger error handler
  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }

  // Example: if the access token is valid for 10s
  // We'll refresh it when it has 1/3 time left (i.e. ~3s remaining)
  // Remaining time = decodedAccessToken.exp - now
  // Total access token lifespan = decodedAccessToken.exp - decodedAccessToken.iat
  if (
    param?.force ||
    decodedAccessToken.exp - now <
      (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    // Call refresh token API
    try {
      const role = decodedRefreshToken.role
      const res =
        role === Role.Guest
          ? await guestApiRequest.refreshToken() : await guestApiRequest.refreshToken()
          // : await authApiRequest.refreshToken()

      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const getVietnameseDishStatus = (
  status: (typeof DishStatus)[keyof typeof DishStatus]
) => {
  switch (status) {
    case DishStatus.Available:
      return 'Available'
    case DishStatus.Unavailable:
      return 'Unavailable'
    default:
      return 'Hide'
  }
}

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus]
) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Delivered'
    case OrderStatus.Paid:
      return 'Paid'
    case OrderStatus.Pending:
      return 'Pending'
    case OrderStatus.Processing:
      return 'Processing'
    default:
      return 'Rejected'
  }
}

export const getVietnameseTableStatus = (
  status: (typeof TableStatus)[keyof typeof TableStatus]
) => {
  switch (status) {
    case TableStatus.Available:
      return 'Available'
    case TableStatus.Reserved:
      return 'Reserved'
    default:
      return 'Hide'
  }
}

export const getTableLink = ({
  token,
  tableNumber
}: {
  token: string
  tableNumber: number
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL +
    `/${defaultLocale}/tables/` +
    tableNumber +
    '?token=' +
    token
  )
}

export const decodeToken = (token: string) => {
  return jwtDecode(token) as TokenPayload
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(
    removeAccents(matchText.trim().toLowerCase())
  )
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(
    date instanceof Date ? date : new Date(date),
    'HH:mm:ss dd/MM/yyyy'
  )
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}

export const generateSocketInstace = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
}

export const wrapServerApi = async <T>(fn: () => Promise<T>) => {
  let result = null
  try {
    result = await fn()
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
  }
  return result
}

export const generateSlugUrl = ({ name, id }: { name: string; id: number }) => {
  return `${slugify(name)}-i.${id}`
}

export const getIdFromSlugUrl = (slug: string) => {
  return Number(slug.split('-i.')[1])
}
