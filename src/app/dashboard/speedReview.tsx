'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import Card from '@/components/card';
import { CardProps } from '@/type';
import { Rating } from 'ts-fsrs';

type FSRSSessionItem = {
  fsrs: {
    cardId: string;
    due: Date;
  };
  card: CardProps;
};

export default function SpeedReview() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FSRSSessionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history/fsrs');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch FSRS cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRate = async (rating: Rating) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setItems([]);
      setCurrentIndex(0);
      fetchData();
    }

    try {
      await fetch('/api/history/fsrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentItem.fsrs.cardId,
          rating: rating,
        }),
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        {t('common.loading')}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center w-full h-full p-4'>
        <p className='text-3xl mb-4 dark:text-gray-200 text-gray-500'>
          {t('dashboard.speedReview.noWords')}
        </p>
        <button
          onClick={fetchData}
          className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600'
        >
          {t('common.refresh')}
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className='flex flex-col items-center justify-center w-full h-full dark:bg-gray-700 bg-gray-50'>
      <div className='w-full max-w-2xl px-4 flex flex-col items-center h-[85vh]'>
        <div className='mb-4 text-sm font-medium text-gray-500'>
          {currentIndex + 1} / {items.length}
        </div>

        <div
          className='w-full flex-grow relative cursor-pointer'
          onClick={() => setShowAnswer(true)}
        >
          <Card card={{ ...currentItem.card, flipped: showAnswer }} />
        </div>

        <div className='w-full mt-6 grid grid-cols-4 gap-2 pb-12'>
          {showAnswer ? (
            <>
              <button
                onClick={() => handleRate(Rating.Again)}
                className='py-3 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold hover:bg-red-200 transition-colors'
              >
                {t('dashboard.speedReview.again')}
              </button>
              <button
                onClick={() => handleRate(Rating.Hard)}
                className='py-3 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-bold hover:bg-orange-200 transition-colors'
              >
                {t('dashboard.speedReview.hard')}
              </button>
              <button
                onClick={() => handleRate(Rating.Good)}
                className='py-3 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold hover:bg-green-200 transition-colors'
              >
                {t('dashboard.speedReview.good')}
              </button>
              <button
                onClick={() => handleRate(Rating.Easy)}
                className='py-3 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold hover:bg-blue-200 transition-colors'
              >
                {t('dashboard.speedReview.easy')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className='col-span-4 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-transform active:scale-95'
            >
              {t('components.card.clickToFlip')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
