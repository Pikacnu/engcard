'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // Added
import Deck from '@/components/deck';
import { CardProps, DeckType, UserSettings } from '@/type';
import { removeMarkWord } from '@/utils/functions/user-data';

type WithId<T> = {
  deckId: string;
} & T;

export default function SpeedReview() {
  const { t } = useTranslation(); // Added
  const [words, setWords] = useState<CardProps[]>([]);
  const [deckActionType, setDeckActionType] = useState<DeckType>(
    DeckType.AutoChangeToNext,
  );

  useEffect(() => {
    const getData = async () => {
      let response = await fetch('/api/history/mark');
      if (!response.ok) {
        console.log('Failed to fetch words:', response.statusText);
        return;
      }
      const cardData = await response.json();
      setWords(cardData.words);

      response = await fetch('/api/settings');
      if (!response.ok) {
        console.log('Failed to fetch settings:', response.statusText);
        return;
      }
      const settings = (await response.json()) as UserSettings;
      if (!settings) {
        console.log('No settings found');
        return;
      }
      setDeckActionType(settings.deckActionType || DeckType.AutoChangeToNext);
    };
    getData();
  }, []); // Added empty dependency array to run once on mount

  const [removableWord, setRemovableWord] = useState<WithId<CardProps> | null>(
    null,
  );

  const removeWord = async (word: WithId<CardProps>) => {
    const updatedWords = words.filter((w) => w.word !== word.word);
    setWords(updatedWords);
    await removeMarkWord(word.word, word.deckId);
  };

  return (
    <div className='flex flex-col items-center justify-center w-full h-full dark:bg-gray-700 dark:text-white'>
      <div className='flex flex-col items-center justify-center w-full h-full p-4 text-center'>
        {words.length <= 0 ? (
          <p className='text-3xl mb-4 dark:text-gray-200 text-gray-500'>
            <span>{t('dashboard.speedReview.noWords')}</span>
          </p>
        ) : (
          <div className='w-full max-w-4xl [&>*]:max-w-full [&>*]:min-w-1/2 relative flex items-center flex-col'>
            <Deck
              cards={words}
              onFinishClick={() => {
                setWords((prev) => [...prev]);
              }}
              deckType={deckActionType}
              updateCurrentWord={(card) => {
                const fn = (
                  card: SetStateAction<CardProps | undefined>,
                ): card is WithId<CardProps> => !!card && 'deckId' in card;
                if (fn(card)) {
                  setRemovableWord(card);
                }
              }}
            ></Deck>
            <div>
              {removableWord && (
                <div className=' absolute top-0 right-1/4 translate-x-1/2 translate-y-1/2 z-20 p-2 bg-red-500 text-white rounded-full flex'>
                  <button
                    onClick={() => removeWord(removableWord)}
                    className='text-sm w-full flex flex-grow text-center items-center justify-center'
                  >
                    {t('dashboard.speedReview.remove')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
