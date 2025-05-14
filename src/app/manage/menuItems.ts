import { Home, LineChart, ShoppingCart, Users2, Salad, Table, LayoutDashboard } from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/'
  },
  {
    title: 'Dashboard',
    Icon: LayoutDashboard,
    href: '/manage/dashboard'
  },
  {
    title: 'Orders',
    Icon: ShoppingCart,
    href: '/manage/orders'
  },
  {
    title: 'Tables',
    Icon: Table,
    href: '/manage/tables'
  },
  {
    title: 'Dishes',
    Icon: Salad,
    href: '/manage/dishes'
  },

  {
    title: 'Analytics',
    Icon: LineChart,
    href: '/manage/analytics'
  },
  {
    title: 'Accounts',
    Icon: Users2,
    href: '/manage/accounts'
  }
]

export default menuItems
