'use client'
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger
 } from '@/components/ui/dropdown-menu'
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
 import { Button } from '@/components/ui/button'
 import Link from 'next/link'
 
 const account = {
   name: 'Ben Davies',
   avatar: 'https://i.pravatar.cc/150'
 }
 
 const DropdownAvatar = () => {
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant='outline' size='icon' className='overflow-hidden rounded-full'>
           <Avatar>
             <AvatarImage src={account.avatar ?? undefined} alt={account.name} />
             <AvatarFallback>{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
           </Avatar>
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align='end'>
         <DropdownMenuLabel>{account.name}</DropdownMenuLabel>
         <DropdownMenuSeparator />
         <DropdownMenuItem asChild>
           <Link href={'/manage/setting'} className='cursor-pointer'>
             Setting
           </Link>
         </DropdownMenuItem>
         <DropdownMenuItem>Support</DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem>Logout</DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   )
 }
 
 export default DropdownAvatar