import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import AccountTable from '@/app/manage/accounts/account-table'
import { Suspense } from 'react'

const Dashboard = () => {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card x-chunk='dashboard-06-chunk-0'>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Employee account management</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountTable />
            <Suspense>
              <AccountTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default Dashboard
