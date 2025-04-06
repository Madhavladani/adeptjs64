'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, X, LogOut, User, KeyRound, ChevronDown, CrownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

// Define interface for menu items
interface MenuItem {
  id: string;
  name: string;
  type: 'category' | 'subcategory';
  url: string;
}

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [accountType, setAccountType] = useState(0); // 0 = Free, 1 = Pro
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          // Store email from auth
          setUserEmail(session.user.email || '');
          
          // Get user info
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, account_type')
            .eq('id', session.user.id)
            .single();
            
          setUserName(userData?.full_name || session.user.email?.split('@')[0] || 'User');
          setAccountType(userData?.account_type || 0);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        // Store email from auth
        setUserEmail(session.user.email || '');
        
        // Get user info
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, account_type')
          .eq('id', session.user.id)
          .single();
          
        setUserName(userData?.full_name || session.user.email?.split('@')[0] || 'User');
        setAccountType(userData?.account_type || 0);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);
  
  async function fetchMenu() {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu data');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu data');
    } finally {
      setIsLoading(false);
    }
  }

  const handleMenuItemClick = (url: string) => {
    router.push(url);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      // Optional: Add a toast notification
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Navigate to search results page with the query
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
        <div className="container h-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/favicon.png"
                  alt="AdeptUi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-xl">AdeptUi</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-sm w-full mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="w-full pl-10"
                placeholder="Search components..."
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="ml-2"
              disabled={isSearching || !searchQuery.trim()}
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-4">
              {isAuthLoading ? (
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              ) : isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-8 w-8 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground">{userEmail}</p>
                          <Badge 
                            className={accountType === 1 ? "bg-green-500 hover:bg-green-600 text-xs" : "bg-gray-500 hover:bg-gray-600 text-xs"}
                          >
                            {accountType === 1 ? 'Pro' : 'Free'}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/change-password" className="flex items-center w-full">
                        <KeyRound className="mr-2 h-4 w-4" />
                        <span>Change Password</span>
                      </Link>
                    </DropdownMenuItem>
                    {accountType === 0 && (
                      <DropdownMenuItem>
                        <Link href="/pricing" className="flex items-center w-full">
                          <CrownIcon className="mr-2 h-4 w-4 text-yellow-500" />
                          <span className="text-blue-600 font-medium">Upgrade to Pro</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/signup">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </nav>
            {!isLoggedIn && (
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Go Pro
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-background border-r transition-transform duration-200 ease-in-out z-40",
          {
            "translate-x-0": isOpen,
            "-translate-x-full lg:translate-x-0": !isOpen
          }
        )}
      >
        <div className="h-full overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : (
            <div className="space-y-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleMenuItemClick(item.url)}
                  className={cn(
                    "flex items-center w-full px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                    item.type === 'subcategory' && "pl-4 text-muted-foreground hover:text-foreground",
                    pathname === item.url && "bg-accent text-accent-foreground"
                  )}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}