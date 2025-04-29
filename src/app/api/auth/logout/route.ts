// API Logout handler
// Once we have retrieved the data below, there's no need for cookies anymore
import authApiRequest from '@/apiRequests/auth'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { HttpError } from '@/lib/http'

export async function POST(request: Request) {
  // res is the body sent by the user, already parsed into a structured format
  // Because the user initially sends the body in a `string` format
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  // If there is no AT (access token) or RT (refresh token) in the cookie
  // Regardless of how the user tries to logout, we still consider the logout successful,
  // even if AT and RT are not sent
  if (!accessToken || !refreshToken) {
    // Even without receiving AT and RT, we still respond with status 200
    return Response.json(
      {
        message: 'Did not receive accessToken and refreshToken'
      },
      {
        status: 200
      }
    )
  }

  try {
    // Send request from Next.js server to Backend server
    const result = await authApiRequest.sLogout({
      accessToken,
      refreshToken
    })

    // Whatever the Backend API returns, this route handler will pass it directly to the user
    return Response.json(result.payload)
  } catch (error) {
    // Even if an error occurs, we still return a 200 (success) status to the user
    return Response.json(
      {
        message: 'Error occurred when calling the Backend server API'
      },
      {
        status: 500
      }
    )
  }
}
