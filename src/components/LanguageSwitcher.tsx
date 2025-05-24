"use client";

import { useTranslation } from '@/context/LanguageContext';
import { useRouter, usePathname } from 'next/navigation'; // Corrected imports for App Router

export const LanguageSwitcher = () => {
  const { t, locale } = useTranslation(); // Assuming 'locale' is available from context
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Remove current locale prefix from pathname if it exists
    const currentLocale = locale || 'en'; // Get current locale from context or default
    let newPath = pathname;

    if (pathname.startsWith(`/${currentLocale}`)) {
      newPath = pathname.replace(`/${currentLocale}`, '');
      if (newPath === '') newPath = '/'; // Handle case where path was just /<locale>
    }
    // If the path was just `/` and currentLocale was the default, it might not have a prefix.
    // Or if the default locale is not prefixed in the URL.
    // Next.js i18n routing usually prefixes all non-default locales.
    // If 'en' is default and not prefixed, newPath would be correct.
    // If 'en' is default AND prefixed, the replace above handles it.

    router.push(`/${newLocale}${newPath === '/' ? '' : newPath}`);
  };

  return (
    <div className="flex items-center space-x-2 p-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium
                    ${locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        aria-pressed={locale === 'en'}
      >
        {t('common.language.english')}
      </button>
      <button
        onClick={() => changeLanguage('zh-TW')}
        className={`px-3 py-1 rounded-md text-sm font-medium
                    ${locale === 'zh-TW' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        aria-pressed={locale === 'zh-TW'}
      >
        {t('common.language.traditionalChinese')}
      </button>
    </div>
  );
};
