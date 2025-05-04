import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 从本地存储获取主题设置,默认为深色主题
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme');
  return (savedTheme as Theme) || 'dark';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [transitioning, setTransitioning] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    if (theme === newTheme || transitioning) return;
    
    setTransitioning(true);
    
    // Create a canvas element for the flooding effect
    const canvas = document.createElement('canvas');
    canvas.id = 'theme-transition-canvas';
    
    // Set canvas to cover the entire viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Position the canvas
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
      backdrop-filter: blur(8px);
    `;
    
    document.body.appendChild(canvas);
    
    // Get 2D context for drawing
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      document.body.removeChild(canvas);
      setTransitioning(false);
      return;
    }
    
    // Determine the starting corner based on the theme direction
    const isToLight = newTheme === 'light';
    
    // Target color - the color of the new theme with alpha for blur effect
    const targetColor = isToLight ? [255, 255, 255, 0.9] : [17, 24, 39, 0.9]; // [r, g, b, a]
    
    // Starting corner (x, y)
    // For dark to light: top-right corner
    // For light to dark: bottom-left corner
    const startX = isToLight ? canvas.width : 0;
    const startY = isToLight ? 0 : canvas.height;
    
    // Animation parameters
    const floodDuration = 500; // ms for flooding phase
    const revealDuration = 500; // ms for reveal phase
    const startTime = performance.now();
    
    // Diagonal distance of the screen - this is the maximum distance any point would need to travel
    const maxDistance = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
    
    // Update the theme halfway through the animation
    setTimeout(() => {
      setTheme(newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, floodDuration);

    // Animation function
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const totalProgress = elapsed / (floodDuration + revealDuration);
      
      if (totalProgress >= 1) {
        // Animation complete
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
        setTransitioning(false);
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fill canvas with the target color with blur effect
      ctx.fillStyle = `rgba(${targetColor[0]}, ${targetColor[1]}, ${targetColor[2]}, ${targetColor[3]})`;
      ctx.filter = 'blur(12px)';
      
      // Create a path that fills the screen from the starting corner
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      if (elapsed <= floodDuration) {
        // Flooding phase
        const floodProgress = Math.min(elapsed / floodDuration, 1);
        const radius = floodProgress * maxDistance * 1.5;
        ctx.arc(startX, startY, Math.max(0, radius), 0, Math.PI * 2);
      } else {
        // Reveal phase
        let revealProgress = (elapsed - floodDuration) / revealDuration;
        revealProgress = Math.min(revealProgress, 1);
        const radius = maxDistance * 1.5 * (1 - revealProgress);
        ctx.arc(startX, startY, Math.max(0, radius), 0, Math.PI * 2);
      }
      
      ctx.fill();
      
      // Continue animation
      requestAnimationFrame(animate);
    };
    
    // Start the animation
    requestAnimationFrame(animate);
    
    // Save theme setting to local storage
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Initial application of theme (no animation)
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};