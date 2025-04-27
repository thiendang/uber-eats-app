'use client'

import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const menuItems = [
  {
    title: 'Dishes',
    href: '/menu'
    // authRequired = undefined means show whether logged in or not
  },
  {
    title: 'Orders',
    href: '/orders',
    authRequired: true
  },
  {
    title: 'Login',
    href: '/login',
    authRequired: false // when false, it means show if not logged in
  },
  {
    title: 'Management',
    href: '/manage/dashboard',
    authRequired: true // when true, it means show only if logged in
  }
]

// Server: Only "Dishes" and "Login" are shown. Because the server doesn't know the user's login status
// Client: Initially, the client also shows "Dishes" and "Login"
// But right after hydration, the client renders "Dishes", "Orders", and "Management" once it detects the login status

export default function NavItems({ className }: { className?: string }) {
  // Initialize similar to server because the server doesn't know login status, so we assume isAuth is false
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(Boolean(getAccessTokenFromLocalStorage()))
  }, [])

  return menuItems.map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    )
  })
}