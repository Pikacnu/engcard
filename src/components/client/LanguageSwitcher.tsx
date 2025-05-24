'use client';

import { useTranslation } from '@/context/LanguageContext';
import useCookie from '@/hooks/cookie';
import { useLocalStorage } from '@/hooks/localstorage';

export const LanguageSwitcher = ({ short = false }: { short?: boolean }) => {
	const { t, locale } = useTranslation(); // Assuming 'locale' is available from context

	const { setCookie } = useCookie();
	const [, setLocalStorage] = useLocalStorage<string>('languageCache', 'en');

	async function changeLanguage(newLocale: string) {
		setLocalStorage(newLocale);
		setCookie('language', newLocale, 200);
		if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	return (
		<div className='flex items-center space-x-2 p-2'>
			<button
				onClick={() => changeLanguage('en')}
				className={`px-3 py-1 rounded-md text-sm font-medium
                    ${
											locale === 'en'
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
				aria-pressed={locale === 'en'}
			>
				{short ? t('common.language.english') : 'en'}
			</button>
			<button
				onClick={() => changeLanguage('zh-TW')}
				className={`px-3 py-1 rounded-md text-sm font-medium
                    ${
											locale === 'zh-TW'
												? 'bg-blue-500 text-white'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
				aria-pressed={locale === 'zh-TW'}
			>
				{short ? t('common.language.chinese') : 'zh-TW'}
			</button>
		</div>
	);
};
