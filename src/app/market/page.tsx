'use client'; // Added

import { Suspense, useEffect, useRef, useState } from 'react';
import Content from './content'; // Assuming Content component handles its own translations or doesn't have text
import { useTranslation } from '@/context/LanguageContext'; // Added
import { redirect, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggler } from '@/components/ThemeToggler';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function Market() {
  const { t } = useTranslation(); // Added
  const searchParams = useSearchParams();
  const fromPage = useRef(searchParams.get('fromPage') || 'basePage');
  const { data: session } = authClient.useSession();
  const [isBiMenuOpen, setIsBiMenuOpen] = useState(false);

  useEffect(() => {
    fromPage.current = searchParams.get('fromPage') || 'basePage';
    if (!session?.user && fromPage.current === 'dashboard') {
      //window.location.search = '?fromPage=basePage';
      fromPage.current = 'basePage';
    }
  }, [searchParams, session]);

  return (
    <div className='flex flex-col items-center justify-start min-h-screen py-2 bg-gray-100 dark:bg-gray-700 w-full mt-16'>
      {fromPage.current === 'dashboard' ? (
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
                  <Image
                    src='/icons/box-arrow-in-left.svg'
                    alt={t('dashboard.navigation.altLogout')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </button>
                <Link
                  href={'/dashboard/settings'}
                  className='settings'
                >
                  <Image
                    src='/icons/gear.svg'
                    alt={t('dashboard.navigation.altSettings')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <ThemeToggler></ThemeToggler>
                <button
                  className='more-options'
                  onClick={() => setIsBiMenuOpen(false)}
                >
                  <Image
                    src='/icons/more.svg'
                    alt={t('dashboard.navigation.altMenu')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </button>
              </div>
            ) : (
              <div className='*:bg-emerald-100 dark:*:bg-emerald-700 dark:*:bg-opacity-40 *:p-2 *:m-2 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
                <Link
                  href='/dashboard'
                  className='home-link'
                >
                  <Image
                    src='/icons/home.svg'
                    alt={t('dashboard.navigation.altLogo')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <Link
                  href='/dashboard/search'
                  className='search-link'
                >
                  <Image
                    src='/icons/search.svg'
                    alt={t('dashboard.navigation.altSearch')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <Link
                  href='/dashboard/deck'
                  className='deck-link'
                >
                  <Image
                    src='/icons/card.svg'
                    alt={t('dashboard.navigation.altDeck')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <Link
                  href='/dashboard/preview'
                  className='preview-link'
                >
                  <Image
                    src='/icons/file-play.svg'
                    alt={t('dashboard.navigation.altPreview')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <Link
                  href='/dashboard/chat'
                  className='chat-link'
                >
                  <Image
                    src='/icons/chat.svg'
                    alt={t('dashboard.navigation.altChat')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <Link
                  href='/market'
                  className='market-link'
                >
                  <Image
                    src='/icons/shop.svg'
                    alt={t('dashboard.navigation.altMarket')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
                </Link>
                <button
                  className='more-options'
                  onClick={() => setIsBiMenuOpen(true)}
                >
                  <Image
                    src='/icons/more.svg'
                    alt={t('dashboard.navigation.altMenu')}
                    width={24}
                    height={24}
                    className='cursor-pointer'
                  ></Image>
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
