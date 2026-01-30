'use client';

import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(); // For accessibility or labels if needed

  return (
    <button
      onClick={toggleTheme}
      className='p-2 m-2 rounded-full  transition-all duration-200 dark:bg-white bg-inherit'
      aria-label={
        theme === 'dark'
          ? t('common.theme.switchToLight')
          : t('common.theme.switchToDark')
      }
      title={
        theme === 'dark'
          ? t('common.theme.switchToLight')
          : t('common.theme.switchToDark')
      }
    >
      {theme === 'dark' ? (
        <Sun
          size={24}
          className='text-gray-700 dark:text-white'
        />
      ) : (
        <Moon
          size={24}
          className='text-gray-700 dark:text-white'
        />
      )}
    </button>
  );
};
