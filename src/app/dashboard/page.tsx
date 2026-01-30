'use server';
import { getRecentlyHistory, getRecentHotWords } from '@/actions/history';
import QuickReview from './speedReview';
import { Suspense } from 'react';
import { createTranslator } from '@/lib/translator';
import { cookies } from 'next/headers';
import { LangEnum } from '@/type';

const maxWords = 5;

export default async function DashBoard() {
  const cookie = await cookies();
  const lang = cookie.get('language')?.value || LangEnum.TW;
  const t = createTranslator(lang); // server side translation
  const recentHistory = await getRecentlyHistory();
  const hotWord = await getRecentHotWords(5);
  const hotWords = hotWord
    .map((word) => {
      const count = word.count;
      const words = word.entries.map((w: string) => ({
        word: w,
        count,
      }));
      return [...words];
    })
    .flat()
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className='h-full p-4 flex flex-row overflow-auto max-md:flex-col-reverse items-center dark:bg-gray-700 gap-8 justify-between'>
      <div className='w-full max-w-4xl flex flex-col space-y-4 *:flex-grow max-h-[100vh] mt-4'>
        <div className='mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-black dark:text-white'>
          <input
            type='checkbox'
            id='recent-history'
            className='peer hidden bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out'
          />
          <label htmlFor='recent-history'>
            <span className='text-gray-500 dark:text-gray-400 text-sm md:hidden'>
              {t('dashboard.home.toggleRecentHistory')}
            </span>
          </label>
          <div className='max-md:hidden peer-checked:block'>
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
                      {item.words.slice(0, maxWords).map((word, i2) => (
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
        </div>
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-black dark:text-white'>
          <input
            type='checkbox'
            id='hot-words'
            className='peer hidden bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out'
          />
          <label htmlFor='hot-words'>
            <span className='text-gray-500 dark:text-gray-400 text-sm md:hidden'>
              {t('dashboard.home.toggleHotWords')}
            </span>
          </label>
          <div className='max-md:hidden peer-checked:block'>
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
                        #{index + 1}
                      </td>
                      <td className='border border-gray-200 dark:border-gray-600 px-4 py-2 text-blue-700 dark:text-blue-400'>
                        {word.word}
                      </td>
                      <td className='border border-gray-200 dark:border-gray-600 px-4 py-2'>
                        {word.count} {t('dashboard.home.countSuffix')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='text-gray-500 dark:text-gray-400'>
                {t('dashboard.home.noHotWords')}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='md:w-[40vw] w-full flex flex-col space-y-4 *:flex-grow *:overflow-auto items-center md:sticky top-8'>
        <Suspense
          fallback={
            <div className='text-black dark:text-white'>
              {t('common.loadingText')}
            </div>
          }
        >
          <QuickReview></QuickReview>
        </Suspense>
      </div>
    </div>
  );
}
