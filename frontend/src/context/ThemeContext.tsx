import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('bidflow-theme');
    return (saved as Theme) || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Resolved theme based on user preference or system
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add resolved theme class
    root.classList.add(resolvedTheme);
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', resolvedTheme);
    
    // Persist preference
    localStorage.setItem('bidflow-theme', theme);
  }, [theme, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('bidflow-theme') as Theme;
    const initialTheme = saved || 'system';
    setThemeState(initialTheme);
    
    // Set initial class
    const root = document.documentElement;
    const initialResolved = initialTheme === 'system' ? systemTheme : initialTheme;
    root.classList.remove('light', 'dark');
    root.classList.add(initialResolved);
    root.setAttribute('data-theme', initialResolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to get theme icon
export function useThemeIcon() {
  const { theme, resolvedTheme } = useTheme();
  
  const getIcon = () => {
    if (theme === 'system') return '⚙️';
    if (resolvedTheme === 'dark') return '🌙';
    return '☀️';
  };
  
  const getLabel = () => {
    if (theme === 'system') return 'Sistema';
    if (resolvedTheme === 'dark') return 'Escuro';
    return 'Claro';
  };
  
  return { icon: getIcon(), label: getLabel() };
}