'use client'; // Added

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { DeckCollection, Lang } from '@/type';
import { LangCodeToName } from '@/utils/lang';

interface MarketDeck extends Pick<DeckCollection, 'name' | 'isPublic'> {
  _id: string;
  cardInfo: {
    length: number;
    langs: Lang[];
  };
}

function MarketContent() {
  const { t } = useTranslation();
  const [decks, setDecks] = useState<MarketDeck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicDecks = useCallback(async () => {
    setLoading(true);
    try {
      const resPublic = await fetch('/api/deck/public?type=full');
      if (!resPublic.ok) {
        console.error('Failed to fetch public decks');
        setDecks([]);
        setLoading(false);
        return;
      }
      const publicDecksData = await resPublic.json();
      const allPublicDecks: MarketDeck[] = publicDecksData.decks || [];
      const filteredDecks = allPublicDecks.filter(
        (deck) => deck.cardInfo.length !== 0,
      );
      setDecks(filteredDecks);
    } catch (error) {
      console.error('Error fetching public decks:', error);
      setDecks([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPublicDecks();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchPublicDecks]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center p-10 space-y-4'>
        <Loader2 className='w-10 h-10 animate-spin text-blue-500' />
        <p className='text-gray-500 dark:text-gray-400'>
          {t('common.loadingText')}
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-da max-w-screen-xl mx-auto'>
      {decks.length !== 0 ? (
        decks.map((deck) => {
          return (
            <Link
              key={deck._id.toString()}
              className='flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out'
              href={`/share?deck=${deck._id.toString()}`}
            >
              <h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
                {t('market.deckNameLabel')} {deck.name} {/* Translated */}
              </h1>
              <p className='text-gray-600 dark:text-gray-300'>
                {deck.cardInfo.length} {t('market.cardsSuffix')}{' '}
              </p>
              <p>
                {t('market.languagesLabel')}{' '}
                {deck.cardInfo.langs.length > 0
                  ? deck.cardInfo.langs
                      .map((lang) => LangCodeToName(lang))
                      .join(', ')
                  : t('market.noLanguages')}
              </p>
            </Link>
          );
        })
      ) : (
        <div className='col-span-full row-span-4 text-center text-2xl font-bold flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
          <p>{t('market.noPublicDecks')}</p>
        </div>
      )}
    </div>
  );
}

function MarketMain() {
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
      <MarketContent />
    </div>
  );
}

export default function Market() {
  return (
    <Suspense>
      <MarketMain />
    </Suspense>
  );
}
