import React from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Moon, Sun, User, Settings, LogOut } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <span className="text-lg font-bold text-primary-foreground">M</span>
        </div>
        <span className="text-xl font-bold">MedOptix</span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="Open user menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
          </Button>

          {/* Dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card shadow-lg">
              <div className="p-2">
                <div className="px-3 py-2 text-sm font-medium">
                  Dr. Sarah Johnson
                </div>
                <div className="px-3 py-1 text-xs text-muted-foreground">
                  sarah.johnson@medoptix.com
                </div>
              </div>
              <div className="border-t">
                <button
                  className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {}}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </button>
                <button
                  className="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => {}}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;