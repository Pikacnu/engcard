'use client';

import useCookie from '@/hooks/cookie';
import { useLocalStorage } from '@/hooks/localstorage';
import { Lang, LangNames, Langs } from '@/types/lang';
import { useEffect } from 'react';

export const LanguageSwitcher = ({ short = false }: { short?: boolean }) => {
  const { setCookie } = useCookie();
  const [languageCache, setLocalStorage] = useLocalStorage<string>(
    'languageCache',
    'en',
  );
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<Lang>(
    'language',
    languageCache as Lang,
  );

  async function changeLanguage(newLocale: Lang) {
    console.log('Changing language to:', newLocale);
    setLocalStorage(newLocale);
    setCookie('language', newLocale, 200);
    // if (typeof window !== 'undefined') {
    //   window.location.reload();
    // }
  }

  useEffect(() => {
    setSelectedLanguage(languageCache as Lang);
  }, [languageCache, setSelectedLanguage]);

  return (
    <div className='flex items-center space-x-2 p-2 border-0 rounded-lg bg-gray-200 dark:bg-gray-800 shadow-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200'>
      <select
        className='bg-transparent outline-none text-sm text-black dark:text-white'
        value={selectedLanguage}
        onChange={(e) => changeLanguage(e.target.value as Lang)}
      >
        {Langs.map((lang) => (
          <option
            className='hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 text-black dark:text-white dark:bg-gray-700 p-2'
            key={lang}
            value={lang}
            onSelect={() => setSelectedLanguage(lang)}
          >
            {short ? lang : LangNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};
