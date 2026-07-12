import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/features/theme/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        title="Light mode"
        aria-label="Switch to light mode"
        className="w-9 h-9 px-0"
      >
        <Sun className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        title="Dark mode"
        aria-label="Switch to dark mode"
        className="w-9 h-9 px-0"
      >
        <Moon className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        title="System preference"
        aria-label="Use system preference"
        className="w-9 h-9 px-0"
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  );
}
