// import environment config and helper utilities
import envConfig from "@/config";
import { normalizePath } from '@/lib/utils'
import { LoginResType } from '@/schemaValidations/auth.schema'
import { redirect } from 'next/navigation'

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined
}

const ENTITY_ERROR_STATUS = 422
const AUTHENTICATION_ERROR_STATUS = 401

// The expected API response format will look like this
type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

// It's recommended to throw a custom error that extends the base Error object,
// so that the error can be traced with a clear message.
// Simply throwing a generic object won't show the error line.
export class HttpError extends Error {
  status: number
  payload: {
    message: string
    [key: string]: any // Additional unknown fields
  }
  constructor({ status, payload, message = 'HTTP Error' }: { status: number; payload: any; message?: string }) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

// Define a specific error class for entity validation errors
export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS
  payload: EntityErrorPayload
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS; payload: EntityErrorPayload }) {
    super({ status, payload, message: 'Entity Validation Error' })
    if (status !== ENTITY_ERROR_STATUS) {
      throw new Error('EntityError must have status 422')
    }
    this.status = status
    this.payload = payload
  }
}

// Variable to prevent duplicate logout requests
let clientLogoutRequest: null | Promise<any> = null

// Helper function to check if we are running in a client environment
export const isClient = typeof window !== 'undefined'

// Request function that works in both client and server components
const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: CustomOptions
) => {
  let body: FormData | string | undefined = undefined
  if (options?.body instanceof FormData) {
    body = options.body
  } else if (options?.body) {
    body = JSON.stringify(options.body)
  }

  const baseHeaders: { [key: string]: string } =
    body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }

  if (isClient) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`
    }
  }

  // Use custom baseUrl if provided; otherwise default to envConfig endpoint
  const baseUrl = options?.baseUrl === undefined ? envConfig.NEXT_PUBLIC_API_ENDPOINT : options.baseUrl
  const fullUrl = `${baseUrl}/${normalizePath(url)}`
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers
    } as any,
    body,
    method
  })

  const payload: Response = await res.json()
  const data = { status: res.status, payload }

  // Interceptor: handle response before returning to the caller
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(data as {
        status: typeof ENTITY_ERROR_STATUS
        payload: EntityErrorPayload
      })
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      // For client-side
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch('/api/auth/logout', {
            method: 'POST',
            body: null,
            headers: { ...baseHeaders } as any
          })

          try {
            await clientLogoutRequest
          } catch (error) {
            // Ignore errors
          } finally {
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            clientLogoutRequest = null
            location.href = '/login'
          }
        }
      } else {
        // For server-side logout handling
        const accessToken = (options?.headers as any)?.Authorization.split('Bearer ')[1]
        redirect(`/logout?accessToken=${accessToken}`)
      }
    } else {
      throw new HttpError(data)
    }
  }

  // After successful login/logout, update local storage (client-side only)
  if (isClient) {
    const normalizeUrl = normalizePath(url)
    if (normalizeUrl === 'api/auth/login') {
      const { accessToken, refreshToken } = (payload as LoginResType).data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    } else if (normalizeUrl === 'api/auth/logout') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  return data
}

// Shorthand HTTP methods
const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('GET', url, options)
  },
  post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PUT', url, { ...options, body })
  },
  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('DELETE', url, options)
  }
}

export default http