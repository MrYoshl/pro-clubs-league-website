'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, User, Settings, LogOut, Shield, UserCog } from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAdmin, isManager, signOut } = useAuth();

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Competitive E-Sports League
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/teams" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Teams
            </Link>
            <Link 
              href="/players" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Players
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost\" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-600">
                        {typeof profile?.discord_username === 'string' && profile.discord_username.length > 0
                          ? profile.discord_username.charAt(0).toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{profile?.discord_username}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">
                        {profile?.pro_clubs_name}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  
                  <DropdownMenuItem asChild>
                    <Link href={`/player/${profile?.id}`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center text-red-400">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {isManager && (
                    <DropdownMenuItem asChild>
                      <Link href="/manager" className="flex items-center text-blue-400">
                        <UserCog className="mr-2 h-4 w-4" />
                        Manager Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-gray-700" />
                  
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="flex items-center text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}