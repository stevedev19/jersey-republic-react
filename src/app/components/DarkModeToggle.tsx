import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface DarkModeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ onToggle }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
    
    onToggle?.(newTheme);
  };

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            background: isDark 
              ? 'linear-gradient(45deg, #667eea, #764ba2)' 
              : 'linear-gradient(45deg, #f8f8ff, #d7b686)',
            color: isDark ? '#f8f8ff' : '#343434',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(52,52,52,0.2)'}`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            '&:hover': {
              background: isDark 
                ? 'linear-gradient(45deg, #764ba2, #667eea)' 
                : 'linear-gradient(45deg, #d7b686, #f8f8ff)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </motion.div>
          </AnimatePresence>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default DarkModeToggle;
