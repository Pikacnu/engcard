'use client';
import Link from 'next/link';
//import { useTranslation } from '@/context/LanguageContext';
import { ThemeToggler } from './ThemeToggler';
import { Home, Info, Store, Download, LogIn } from 'lucide-react';

export function NavBar() {
  //const { t } = useTranslation();
  return (
    <div className='sticky top-0 z-20 flex items-center justify-between w-full bg-white  bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-70 backdrop-blur-sm shadow-lg'>
      <div className='flex items-center justify-center text-gray-700 dark:text-white [&>a]:dark:bg-white [&>a>svg]:dark:text-black'>
        <Link
          href={'/'}
          className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
        >
          <Home size={24} />
        </Link>
        <Link
          href={'/info'}
          className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
        >
          <Info size={24} />
        </Link>
        <Link
          href={'/market'}
          className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
        >
          <Store size={24} />
        </Link>
        <Link
          href={'/download'}
          className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
        >
          <Download size={24} />
        </Link>
      </div>
      {/* Login button icon color: text-gray-700 dark:text-white */}
      <div className='flex items-center text-gray-700 dark:text-white'>
        <ThemeToggler />{' '}
        {/* ThemeToggler itself handles its icon color internally now */}
        <Link
          href={'/auth/login'}
          className='self-center min-w-max
								bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 p-2 m-2 hover:shadow-xl shadow-white rounded-full
								dark:bg-white'
        >
          <LogIn
            size={24}
            className='text-gray-700 dark:text-black'
          />
        </Link>
      </div>
    </div>
  );
}
