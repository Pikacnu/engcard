'use client';

import DeckPreview from '@/components/server/deck';
import { ObjectId, WithId, Document } from 'mongodb';
import { useEffect, useState, useCallback } from 'react';
import AddDeck from '@/components/server/adddeck';
import { deleteDeck, getShareDeck } from '@/actions/deck';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useCopyToClipboard } from '@/hooks/copy';
import { useTranslation } from '@/context/LanguageContext'; // Added

type Deck = WithId<Document> & {
  name: string;
  public: boolean;
  isPublic?: boolean;
};

export default function Deck() {
  const { t } = useTranslation(); // Added
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [sharedDecks, setSharedDecks] = useState<Deck[] | null>(null);
  const [deckId, setDeckId] = useState<ObjectId | null>(null);
  const [isOpenAddArea, setIsOpenAddArea] = useState(false);

  const updateDecks = useCallback(() => {
    fetch('/api/deck')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          return;
        }
        setDecks(data);
      });
    fetch('/api/deck/public?type=full')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          return;
        }
        setSharedDecks(data.decks);
      });
  }, []);
  useEffect(() => {
    updateDecks();
  }, [updateDecks]);

  const { copyToClipboard } = useCopyToClipboard();

  return (
    <div className='flex flex-col w-full h-full flex-grow dark:bg-gray-700 dark:text-white'>
      {deckId && (
        <div className='absolute w-full h-screen overflow-hidden bg-black bg-opacity-40 top-0 left-0 flex items-center justify-center z-20'>
          <DeckPreview
            deckId={`${deckId.toString()}`}
            onClose={() => setDeckId(null)}
          />
        </div>
      )}
      {isOpenAddArea && (
        <div
          className='fixed w-full h-screen bg-black bg-opacity-40 top-0 left-0 flex items-center justify-center z-20'
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpenAddArea(false);
            }
          }}
        >
          <AddDeck
            onSubmit={async () => {
              setIsOpenAddArea(false);
              updateDecks();
            }}
          />
        </div>
      )}
      {decks === null ? (
        <div className='flex flex-col items-center justify-center h-[80vh]'>
          <svg
            aria-hidden='true'
            className='w-16 h-16 animate-spin text-gray-600 dark:text-gray-300 fill-blue-600'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
              fill='currentColor'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
              fill='currentFill'
            />
          </svg>
          <span className='sr-only'>{t('dashboard.deck.altLoading')}</span>
          <p className='text-lg text-gray-500 dark:text-gray-400'>
            {t('common.loadingText')}
          </p>
        </div>
      ) : (
        <div className='p-4 flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:grid-rows-3 lg:gap-6 max-lg:grid-rows-3 max-lg:gap-3 *:rounded-lg *:shadow-lg *:bg-gray-100 dark:*:bg-gray-800'>
          {(decks &&
            decks.map((deck) => (
              <div
                className='grid grid-cols-2 items-center justify-center p-2 bg-white dark:bg-gray-800 gap-4 *:*:m-1 text-gray-800 dark:text-gray-100'
                key={deck._id.toString()}
              >
                <div className='flex flex-col shadow-lg p-2 rounded-lg bg-blue-100 dark:bg-blue-700 bg-opacity-70 dark:bg-opacity-70'>
                  <h1>
                    <p className='border-2 inline p-1 m-1 border-gray-300 dark:border-gray-600'>
                      {t('dashboard.deck.nameLabel')}
                    </p>
                    {deck.name}
                  </h1>
                  <h1>
                    <p className='border-2 inline p-1 m-1 border-gray-300 dark:border-gray-600'>
                      {t('dashboard.deck.publicLabel')}
                    </p>
                    {deck.isPublic
                      ? t('dashboard.deck.isPublicYes')
                      : t('dashboard.deck.isPublicNo')}
                  </h1>
                  <button
                    className='flex flex-col bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 p-2 rounded-lg mt-2'
                    onClick={() => setDeckId(deck._id)}
                  >
                    {t('dashboard.deck.previewButton')}
                  </button>
                </div>
                <div className='flex flex-col m-1 bg-green-100 dark:bg-green-700 bg-opacity-30 dark:bg-opacity-30 rounded-lg p-2 *:bg-opacity-80 *:rounded-md *:p-2 *:text-center *:my-1'>
                  <Link
                    className='bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    href={`/dashboard/deck/edit/${deck._id.toString()}`}
                  >
                    {t('dashboard.deck.editButton')}
                  </Link>
                  <button
                    className='bg-red-300 dark:bg-red-700 hover:bg-red-400 dark:hover:bg-red-600'
                    onClick={async () => {
                      await deleteDeck.bind(null, deck._id.toString())();
                      updateDecks();
                    }}
                  >
                    {t('dashboard.deck.deleteButton')}
                  </button>
                  <button
                    className='bg-blue-300 dark:bg-blue-700 hover:bg-blue-400 dark:hover:bg-blue-600'
                    onClick={async () => {
                      const searchparams = await getShareDeck(
                        deck._id.toString(),
                      );
                      redirect(`/share?${searchparams}`);
                    }}
                  >
                    {t('dashboard.deck.shareButton')}
                  </button>
                </div>
              </div>
            ))) || (
            <h1 className='col-span-full row-span-full text-center text-2xl text-gray-500 dark:text-gray-400'>
              {t('dashboard.deck.noDecksFound')}
            </h1>
          )}

          {(sharedDecks &&
            sharedDecks.map((deck) => (
              <div
                className='grid grid-cols-2 items-center justify-center p-2 bg-white dark:bg-gray-800 gap-4 *:*:m-1 text-gray-800 dark:text-gray-100'
                key={deck._id.toString()}
              >
                <div className='flex flex-col shadow-lg p-2 rounded-lg bg-blue-100 dark:bg-blue-700 bg-opacity-70 dark:bg-opacity-70'>
                  <h1>
                    <p className='border-2 inline p-1 m-1 border-gray-300 dark:border-gray-600'>
                      {t('dashboard.deck.nameLabel')}
                    </p>
                    {deck.name}
                  </h1>
                  <h1>
                    <p className='border-2 inline p-1 m-1 border-gray-300 dark:border-gray-600'>
                      {t('dashboard.deck.publicLabel')}
                    </p>
                    {t('dashboard.deck.isPublicYes')}
                  </h1>
                  <Link
                    className='flex flex-col bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 p-2 rounded-lg mt-2'
                    href={`/share?deck=${deck._id.toString()}`}
                  >
                    {t('dashboard.deck.previewButton')}
                  </Link>
                </div>
                <div className='flex flex-col m-1 bg-green-100 dark:bg-green-700 bg-opacity-30 dark:bg-opacity-30 rounded-lg p-2 *:bg-opacity-80 *:rounded-md *:p-2 *:text-center *:my-1'>
                  <button
                    className='bg-red-300 dark:bg-red-700 hover:bg-red-400 dark:hover:bg-red-600'
                    onClick={async () => {
                      const res = await fetch(
                        `/api/deck/${deck._id.toString()}`,
                        {
                          method: 'DELETE',
                        },
                      );
                      if (res.ok) {
                        updateDecks();
                      } else {
                        alert(t('dashboard.deck.alertDeleteFailed')); // Translated
                      }
                    }}
                  >
                    {t('dashboard.deck.deleteButton')}
                  </button>
                  <button
                    className='bg-blue-300 dark:bg-blue-700 hover:bg-blue-400 dark:hover:bg-blue-600'
                    onClick={async () => {
                      const searchparams = await getShareDeck(
                        deck._id.toString(),
                      );
                      copyToClipboard(
                        `${window.location.origin}/share?${searchparams}`,
                      );
                      // Not redirecting here as copyToClipboard implies user might want to paste it elsewhere
                    }}
                  >
                    {t('dashboard.deck.shareButton')}
                  </button>
                </div>
              </div>
            ))) ||
            null}

          <button
            className='shadow p-4 rounded-lg bg-green-200 dark:bg-green-600 hover:bg-green-300 dark:hover:bg-green-500 text-gray-800 dark:text-gray-100 text-xl font-semibold'
            onClick={() => setIsOpenAddArea(true)}
          >
            {t('dashboard.deck.addButton')}
          </button>
        </div>
      )}
    </div>
  );
}
