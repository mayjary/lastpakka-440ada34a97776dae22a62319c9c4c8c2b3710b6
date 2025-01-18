/* eslint-disable */

'use client'

import Link from 'next/link'
import Image from "next/image";
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ModeToggle } from '@/components/mode-toggle'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Settings, User } from 'lucide-react'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { useEffect, useState } from 'react';

const Header = () => {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

   useEffect(() => {
      const fetchUser = async () => {
        const loggedInUser = await getLoggedInUser() 
        setUser(loggedInUser) 
      }
      fetchUser() 
    }, [])

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Image
            src="/logo.png"
            alt="SpendSmart Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          SpendSmart
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className={`text-foreground hover:text-primary ${pathname === '/' ? 'font-bold' : ''}`}>
            Dashboard
          </Link>
          <Link href="/budget" className={`text-foreground hover:text-primary ${pathname === '/budget' ? 'font-bold' : ''}`}>
            Budget
          </Link>
          <Link href="/goals" className={`text-foreground hover:text-primary ${pathname === '/goals' ? 'font-bold' : ''}`}>
            Goals
          </Link>
          <Link href="/settings" className={`text-foreground hover:text-primary ${pathname === '/settings' ? 'font-bold' : ''}`}>
            Settings
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
        <Link href="/settings" className={`p-2 ${pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Settings size={24} />
            </Link>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>{`${user.firstName} ${user.lastName}`}</DropdownMenuLabel>
                  <DropdownMenuItem><Link href="/settings" className={`p-2 ${pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="/linked-accounts" className={`p-2 ${pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>Bank</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="/" className={`p-2 ${pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>Home</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/sign-in">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/sign-up">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header

