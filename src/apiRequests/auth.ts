import http from '@/lib/http'
import { LoginBodyType, LoginResType } from '@/schemaValidations/auth.schema'
import { MessageResType } from '@/schemaValidations/common.schema'

const authApiRequest = {
  login: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  auth: (body: { sessionToken: string; expiresAt: string }) =>
    http.post('/api/auth', body, {
      baseUrl: ''
    }),

  // API logout call from 'next-server' to 'serverBE'
  logoutFromNextServerToServer: (sessionToken: string) =>
    http.post<MessageResType>(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      }
    ),

  logoutFromNextClientToNextServer: (force?: boolean | undefined, signal?: AbortSignal | undefined) =>
    http.post<MessageResType>(
      '/api/auth/logout',
      { force },
      {
        baseUrl: '',
        signal
      }
    )
}

export default authApiRequest
