import { Moon, Sun, Calendar, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import AppButton from './AppButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderProps {
  view: 'daily' | 'main';
  onViewChange: (view: 'daily' | 'main') => void;
}

export default function Header({ view, onViewChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const username = userProfile?.username?.trim();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Determine display label: show placeholder during loading to prevent layout shift
  const displayLabel = isAuthenticated
    ? profileLoading || !isFetched
      ? 'Loading...'
      : username || 'User'
    : '';

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              DailyOS
            </h1>
            <nav className="hidden md:flex gap-2">
              <AppButton
                variant={view === 'main' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('main')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </AppButton>
              <AppButton
                variant={view === 'daily' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('daily')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Daily View
              </AppButton>
            </nav>
          </div>

          {/* Mobile navigation - visible only on small screens */}
          <nav className="flex md:hidden gap-3 ml-6">
            <AppButton
              variant={view === 'main' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('main')}
            >
              <LayoutDashboard className="w-4 h-4" />
            </AppButton>
            <AppButton
              variant={view === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('daily')}
            >
              <Calendar className="w-4 h-4" />
            </AppButton>
            <AppButton
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </AppButton>
          </nav>

          <div className="flex items-center gap-2">
            <AppButton
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </AppButton>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AppButton variant="ghost" className="gap-2 min-w-[100px]">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{displayLabel}</span>
                  </AppButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{displayLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
