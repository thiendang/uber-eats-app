import accountApiRequest from '@/apiRequests/account'
import { toast } from '@/components/ui/use-toast'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import { cookies } from 'next/headers'

const Dashboard = async () => {
  const cookieStore = await cookies()

  const accessToken = getAccessTokenFromLocalStorage() as string
  let name = ''

  try {
    const result = await accountApiRequest.sMeProfile(accessToken)
    name = result.payload.data.name
    toast({
      description: result.payload.message
    })
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
  }
  return <div>Dashboard {name}</div>
}

export default Dashboard
