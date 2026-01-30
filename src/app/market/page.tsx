'use client'; // Added

import { Suspense, useEffect, useRef, useState } from 'react';
import Content from './content'; // Assuming Content component handles its own translations or doesn't have text
import { useTranslation } from '@/context/LanguageContext'; // Added
import { redirect, useSearchParams } from 'next/navigation';
import { ThemeToggler } from '@/components/ThemeToggler';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { NavBar } from '@/components/navbar';
import {
  Home,
  Search,
  Library,
  PlayCircle,
  MessageCircle,
  Store,
  LogOut,
  Settings,
  MoreHorizontal,
} from 'lucide-react';

export default function Market() {
  const { t } = useTranslation(); // Added
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [isBiMenuOpen, setIsBiMenuOpen] = useState(false);

  const rawFromPage = searchParams.get('fromPage') || 'basePage';
  const fromPage =
    !session?.user && rawFromPage === 'dashboard' ? 'basePage' : rawFromPage;

  return (
    <div className='flex flex-col items-center justify-start min-h-screen py-2 bg-gray-100 dark:bg-gray-700 w-full mt-16'>
      {fromPage === 'dashboard' ? (
        <nav className=' absolute top-0 left-0 max-md:w-screen md:h-screen'>
          <div className='flex flex-col max-md:flex-row h-full bg-white dark:bg-gray-800 text-black dark:text-white md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between items-center keyboard:hidden main-nav delay-0 '>
            {isBiMenuOpen ? (
              // Buttons: bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-700 dark:bg-opacity-40 dark:hover:bg-emerald-600
              <div className='*:bg-emerald-100 dark:*:bg-emerald-700 dark:*:bg-opacity-40 *:p-2 *:m-2 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
                <Link
                  href={'/tempword'}
                  className='w-10 break-words max-md:w-auto max-md:h-10 tempword text-black'
                >
                  {t('dashboard.navigation.sevenThousandWords')}
                </Link>
                <button
                  onClick={() => redirect('/auth/logout')}
                  className='logout'
                >
                  <LogOut
                    size={24}
                    className='cursor-pointer'
                  />
                </button>
                <Link
                  href={'/dashboard/settings'}
                  className='settings'
                >
                  <Settings
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <ThemeToggler></ThemeToggler>
                <button
                  className='more-options'
                  onClick={() => setIsBiMenuOpen(false)}
                >
                  <MoreHorizontal
                    size={24}
                    className='cursor-pointer'
                  />
                </button>
              </div>
            ) : (
              <div className='*:bg-emerald-100 dark:*:bg-emerald-700 dark:*:bg-opacity-40 *:p-2 *:m-2 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
                <Link
                  href='/dashboard'
                  className='home-link'
                >
                  <Home
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <Link
                  href='/dashboard/search'
                  className='search-link'
                >
                  <Search
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <Link
                  href='/dashboard/deck'
                  className='deck-link'
                >
                  <Library
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <Link
                  href='/dashboard/preview'
                  className='preview-link'
                >
                  <PlayCircle
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <Link
                  href='/dashboard/chat'
                  className='chat-link'
                >
                  <MessageCircle
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <Link
                  href='/market'
                  className='market-link'
                >
                  <Store
                    size={24}
                    className='cursor-pointer'
                  />
                </Link>
                <button
                  className='more-options'
                  onClick={() => setIsBiMenuOpen(true)}
                >
                  <MoreHorizontal
                    size={24}
                    className='cursor-pointer'
                  />
                </button>
              </div>
            )}
          </div>
        </nav>
      ) : (
        <nav className=' w-screen top-0 left-0 fixed'>
          <NavBar></NavBar>
        </nav>
      )}
      <h1 className='mb-6'>
        <span className='text-2xl font-bold text-gray-800 dark:text-white'>
          {t('market.title')}
        </span>
      </h1>
      <Suspense
        fallback={
          <div className='text-black dark:text-white'>
            {t('common.loadingText')}
          </div>
        }
      >
        <Content />
      </Suspense>
    </div>
  );
}
