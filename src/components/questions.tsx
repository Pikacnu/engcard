'use client';

import { CardProps, PartOfSpeech } from '@/type';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import Spell from './spell';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Questions({
  cards,
  onFinishClick,
  updateCurrentWord,
}: {
  cards: CardProps[];
  onFinishClick?: () => void;
  updateCurrentWord?: Dispatch<SetStateAction<CardProps | undefined>>;
}) {
  const { t } = useTranslation(); // Added

  // Define CardWhenEmpty using translations
  const CardWhenEmpty: CardProps = useMemo(
    () => ({
      word: t('components.list.empty.word'), // Reusing keys from list.tsx
      phonetic: t('components.list.empty.phonetic'),
      blocks: [
        {
          partOfSpeech: PartOfSpeech.Error,
          definitions: [
            {
              definition: [
                {
                  lang: 'en',
                  content: t('components.list.empty.errorContent'),
                },
              ],
              example: [],
              synonyms: [],
              antonyms: [],
            },
          ],
        },
      ],
      flipped: true,
    }),
    [t],
  );

  const [index, setIndex] = useState(0);
  const [cardData, setCard] = useState<CardProps[]>(
    cards && cards.length > 0 ? cards : [CardWhenEmpty],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!cards || cards.length === 0) {
        setCard([CardWhenEmpty]);
        updateCurrentWord?.(undefined);
        setIndex(0);
        return;
      }
      setCard(cards);
      updateCurrentWord?.(cards[index] || cards[0]);
    }, 0);
    return () => clearTimeout(timeout);
  }, [index, cards, updateCurrentWord, CardWhenEmpty]);

  return (
    <div className='flex flex-col h-full max-md:w-[90vw] w-[70vw] md:w-[60vw] lg:w-[50vw] min-w-[20vw] justify-center relative p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md'>
      <Spell
        card={
          cardData && cardData.length > 0 && cardData[index]
            ? cardData[index]
            : CardWhenEmpty
        }
        className='pb-8 h-[60vh] md:h-[70vh] relative'
        onAnsweredClick={() => {
          setIndex((prev) => {
            if (prev === cardData.length - 1) {
              if (onFinishClick) onFinishClick();
              return 0;
            }
            return prev + 1;
          });
        }}
      />

      {cardData &&
        cardData.length > 0 &&
        cardData[0].word !== t('components.list.empty.word') && (
          <button
            className='bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white p-2 rounded-lg absolute bottom-4 right-4 m-4 text-sm'
            onClick={() => {
              setIndex((prev) => {
                if (prev === cardData.length - 1) {
                  if (onFinishClick) onFinishClick();
                  return 0;
                }
                return prev + 1;
              });
            }}
          >
            {t('components.questions.skipButton')} {/* Translated */}
          </button>
        )}

      {cardData &&
        cardData.length > 0 &&
        cardData[0].word !== t('components.list.empty.word') && ( // Only show progress if not empty card
          <div className='w-full rounded-full h-2.5 bg-gray-300 dark:bg-gray-600 select-none mt-4'>
            <div
              className='bg-blue-600 dark:bg-blue-500 rounded-full h-2.5 transition-all duration-100'
              style={{
                width: `${Math.min(
                  100,
                  ((index + 1) / cardData.length) * 100,
                )}%`,
              }}
            >
              {/* Optional: Text inside progress bar, though it's very small */}
            </div>
          </div>
        )}
    </div>
  );
}
