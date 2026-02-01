'use client';
import { getDeck } from '@/actions/deck';
import Deck from '@/components/deck';
import { DeckCollection } from '@/type';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // Added
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { offlineDB } from '@/lib/offline-db';
import { DeckSelect } from '@/db/schema';

export default function DeckPreview({
  deckId,
  onClose,
}: {
  deckId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(); // Added
  const [deck, setDeck] = useState<DeckCollection | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { syncDeckCards, prefetchAudio } = useOfflineSync();

  useEffect(() => {
    async function loadDeck() {
      // 1. 優先嘗試從本地 IndexedDB 讀取
      const localCards = await offlineDB.cards
        .where('deckId')
        .equals(deckId)
        .toArray();
      const localDeck = await offlineDB.decks.get(deckId);

      if (localDeck && localCards.length > 0) {
        setDeck({
          ...localDeck,
          _id: localDeck.id,
          cards: localCards.map((c) => ({
            word: c.word,
            blocks: c.blocks || [],
            phonetic: c.phonetic || '',
            audio: c.audio || undefined,
            flipped: false,
          })),
        } as unknown as DeckCollection);
        setLoaded(true);
      }

      // 2. 獲取遠端資料並更新
      try {
        const deckData = await getDeck(deckId);
        if (deckData) {
          setDeck(deckData);
          setLoaded(true);
          // 3. 同步到本地
          syncDeckCards(
            deckId,
            deckData.cards.map((c: any, i: number) => ({
              ...c,
              id: `${deckId}_${c.word}_${i}`, // 產生唯一 ID 如果後端沒給
              deckId,
            })),
          );

          // 4. 預抓取音檔
          prefetchAudio(deckData.cards.map((c) => c.audio));
        }
      } catch (err) {
        console.error('Failed to load remote deck:', err);
      }
    }

    loadDeck();
  }, [deckId, syncDeckCards, prefetchAudio]);

  if (!loaded) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
        {' '}
        {/* Added fixed positioning and z-index */}
        <div className='flex items-center justify-between w-auto min-w-[250px] rounded-xl bg-yellow-200 dark:bg-yellow-700 text-black dark:text-white m-2 p-4 shadow-lg'>
          <h1>{t('components.server.deck.loadingText')}</h1> {/* Translated */}
          <button
            onClick={onClose} // Changed from onClose() to onClose
            className='ml-4 px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500'
          >
            {t('components.server.deck.closeButton')} {/* Translated */}
          </button>
        </div>
      </div>
    );
  }
  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
        {' '}
        {/* Added fixed positioning and z-index */}
        <div className='flex items-center justify-between w-auto min-w-[250px] rounded-xl bg-red-300 dark:bg-red-700 text-black dark:text-white m-2 p-4 shadow-lg'>
          <h1>{t('components.server.deck.notFoundText')}</h1> {/* Translated */}
          <button
            onClick={onClose} // Changed from onClose() to onClose
            className='ml-4 px-3 py-1 bg-gray-300 dark:bg-gray-500 rounded hover:bg-gray-400 dark:hover:bg-gray-400'
          >
            {t('components.server.deck.closeButton')} {/* Translated */}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
      {' '}
      {/* Changed absoulte to fixed and set inset-0 */}
      <div className='relative w-full max-w-3xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6'>
        {' '}
        {/* Added relative container for deck and close button */}
        <button
          className='absolute top-2 right-2 p-2 m-1 rounded-full bg-gray-200 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 z-40' // Positioned button inside new container
          onClick={onClose} // Changed from onClose() to onClose
          aria-label={t('components.server.deck.closeButton')} // Added aria-label
        >
          {/* Simple 'X' icon for close */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <line
              x1='18'
              y1='6'
              x2='6'
              y2='18'
            ></line>
            <line
              x1='6'
              y1='6'
              x2='18'
              y2='18'
            ></line>
          </svg>
        </button>
        {deck && <Deck cards={deck.cards} />}{' '}
        {/* Deck component will take full space of its parent */}
      </div>
    </div>
  );
}
