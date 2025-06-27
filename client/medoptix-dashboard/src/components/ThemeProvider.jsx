import { createContext, useContext, useEffect, useState } from "react";

// Create a context for theme
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
});

// Theme provider component
export function ThemeProvider({ children, defaultTheme = "light", storageKey = "medoptix-theme" }) {
  // Initialize theme state from localStorage or defaultTheme
  const [theme, setTheme] = useState(() => {
    // Check if localStorage is available
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey);
      return storedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  // Update theme in localStorage and document when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store the theme in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme);
    }
  }, [theme, storageKey]);

  // Function to toggle between light and dark
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Create the context value
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === "light",
    isDark: theme === "dark",
  };

  // Provide the theme context to children
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};