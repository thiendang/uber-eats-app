import http from '@/lib/http'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType
} from '@/schemaValidations/auth.schema'
import { MessageResType } from '@/schemaValidations/common.schema'

const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number
    payload: RefreshTokenResType
  }> | null,
  
  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),

  login: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, {
      baseUrl: ''
    }),

  // Since `sLogout` will be declared and used in the server environment,
  // it won't automatically attach the accessToken.
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string
    }
  ) =>
    http.post<MessageResType>(
      '/auth/logout',
      {
        refreshToken: body.refreshToken
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`
        }
      }
    ),

  // When logging out on the client,
  // the accessToken (AT) and refreshToken (RT) are automatically sent via cookies
  // when making a request to the Next.js server (route handler),
  // so we don't need to manually pass them.
  logout: () =>
    http.post<MessageResType>('/api/auth/logout', null, {
      baseUrl: ''
    }),
  sRefreshToken: (body: RefreshTokenBodyType) => http.post<RefreshTokenResType>('/auth/refresh-token', body),
  refreshToken: () =>
    http.post<RefreshTokenResType>('/api/auth/refresh-token', null, {
      baseUrl: ''
    })
}

export default authApiRequest
