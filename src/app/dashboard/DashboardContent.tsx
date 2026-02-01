'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { offlineDB, OfflineHistory, OfflineHotWord } from '@/lib/offline-db';
import QuickReview from './speedReview';

const maxWords = 5;

export default function DashboardContent() {
  const { t } = useTranslation();
  const { syncHistory, isOnline } = useOfflineSync();
  const [recentHistory, setRecentHistory] = useState<OfflineHistory[]>([]);
  const [hotWords, setHotWords] = useState<OfflineHotWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Try to sync if online
      if (isOnline) {
        await syncHistory();
      }

      // 2. Read from local DB (which was just updated if online)
      const localHistory = await offlineDB.histories
        .orderBy('date')
        .reverse()
        .limit(10)
        .toArray();
      setRecentHistory(localHistory);

      const localHotWords = await offlineDB.hotWords
        .orderBy('count')
        .reverse()
        .limit(5)
        .toArray();
      setHotWords(localHotWords);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOnline]);

  return (
    <div className='h-full p-4 flex flex-row overflow-auto max-md:flex-col-reverse items-center dark:bg-gray-700 gap-8 justify-between'>
      <div className='w-full max-w-4xl flex flex-col space-y-4 *:flex-grow max-h-[100vh] mt-4'>
        <div className='mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-black dark:text-white'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
            {t('dashboard.home.recentHistoryTitle')}
          </h2>
          <ul className='list-disc pl-5 space-y-2 gap-4'>
            {recentHistory.length > 0 ? (
              recentHistory.map((item, index) => (
                <li
                  key={index}
                  className='text-gray-700 dark:text-gray-300 flex-wrap flex items-center'
                >
                  <span className='font-medium flex flex-wrap gap-2'>
                    {item.words
                      .slice(0, maxWords)
                      .map((word: string, i2: number) => (
                        <span
                          key={word + index.toString() + i2.toString()}
                          className='p-2 rounded-lg bg-blue-700 dark:bg-blue-800 bg-opacity-40 dark:bg-opacity-60 mx-2 text-black dark:text-white'
                        >
                          {word}
                        </span>
                      ))}
                    {item.words.length > maxWords && '...'}
                  </span>
                  <span className='text-gray-500 dark:text-gray-400'>
                    {' - '}
                    {new Date(item.date).toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className='text-gray-500 dark:text-gray-400'>
                {t('dashboard.home.noRecentHistory')}
              </li>
            )}
          </ul>
        </div>

        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-black dark:text-white'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100'>
            {t('dashboard.home.hotWordsTitle')}
          </h2>
          {hotWords.length > 0 ? (
            <table className='table-auto w-full border-collapse border border-gray-200 dark:border-gray-600'>
              <thead>
                <tr className='bg-gray-100 dark:bg-gray-700'>
                  <th className='border border-gray-200 dark:border-gray-600 px-4 py-2 text-left'>
                    {t('dashboard.home.tableRank')}
                  </th>
                  <th className='border border-gray-200 dark:border-gray-600 px-4 py-2 text-left'>
                    {t('dashboard.home.tableWord')}
                  </th>
                  <th className='border border-gray-200 dark:border-gray-600 px-4 py-2 text-left'>
                    {t('dashboard.home.tableCount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {hotWords.map((word, index) => (
                  <tr
                    key={index}
                    className='hover:bg-gray-50 dark:hover:bg-gray-600'
                  >
                    <td className='border border-gray-200 dark:border-gray-600 px-4 py-2'>
                      {index + 1}
                    </td>
                    <td className='border border-gray-200 dark:border-gray-600 px-4 py-2'>
                      {word.word}
                    </td>
                    <td className='border border-gray-200 dark:border-gray-600 px-4 py-2'>
                      {word.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className='text-gray-500 dark:text-gray-400'>
              {t('dashboard.home.noHotWords')}
            </p>
          )}
        </div>
      </div>

      <div className='w-full max-w-md h-full'>
        <QuickReview />
      </div>
    </div>
  );
}
