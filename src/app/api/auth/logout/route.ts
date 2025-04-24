// API Logout handler
import { cookies } from 'next/headers'
import authApiRequest from '@/apiRequests/auth'
import { HttpError } from '@/lib/http'

export async function POST(request: Request) {
  const res = await request.json()
  const force = res.force as boolean | undefined
  if (force) {
    return Response.json(
      {
        message: 'Logout!'
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-Age=0`
        }
      }
    )
  }

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')
  if (!sessionToken) {
    return Response.json(
      { message: 'Not received session token' },
      {
        status: 401
      }
    )
  }

  // Try-catch call to server-BE
  try {
    // result.payload return unknown
    // Send request from `next-server` to `server-BE`
    const result = await authApiRequest.logoutFromNextServerToServer(sessionToken.value)
    return Response.json(result.payload, {
      status: 200,
      headers: {
        // Send request API from next-client to next-server
        // Delele cookie sessionToken
        'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-Age=0`
      }
    })
  } catch (error) {
    // RouteHandler in next-server the same as a proxy 
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status
      })
    } else {
      return Response.json(
        {
          message: 'Something went wrong!'
        },
        {
          status: 500
        }
      )
    }
  }
}
