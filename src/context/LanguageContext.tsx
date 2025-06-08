'use client'; // This context will be used in client components

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from 'react';
import useCookie from '@/hooks/cookie';
import { useLocalStorage } from '@/hooks/localstorage';
import { useBroswerLanguage } from '@/hooks/useLanguage';

// Define the shape of your translation messages
interface Messages {
	[key: string]: string | Messages;
}

interface LanguageContextType {
	locale: string;
	setLocale: (locale: string) => void; // Though changing locale will be via router.push
	translations: Messages;
	t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const { getCookie, setCookie } = useCookie();
	const defaultBroswerLanguage = useBroswerLanguage();
	const [languageCache, setLanguageCache] = useLocalStorage<string>(
		'languageCache',
		defaultBroswerLanguage,
	);
	const [currentLocale, setCurrentLocale] = useState<string>(
		defaultBroswerLanguage,
	);
	const [loadedTranslations, setLoadedTranslations] = useState<Messages>({});
	const [isLoadedCache, setIsLoadedCache] = useState(false);

	const [LanguageDataCache, setLanguageDataCache] = useLocalStorage(
		'LanguageDataCache',
		['null', {} as Messages],
	);

	useEffect(() => {
		const cookieLocale = getCookie('language');
		if (cookieLocale) {
			const cookieLocaleValue = cookieLocale.replaceAll(/["\\]/g, '');
			setCurrentLocale(cookieLocaleValue);
			setLanguageCache(cookieLocaleValue);
			setIsLoadedCache(true);
			return;
		}
		const languageCacheString = languageCache.replaceAll(/["\\]/g, '');
		if (
			languageCacheString &&
			languageCacheString !== 'null' &&
			languageCacheString !== '' &&
			languageCacheString !== 'undefined'
		) {
			setCurrentLocale(languageCacheString);
			setLanguageCache(languageCacheString);
			setIsLoadedCache(true);
			return;
		}
		setCurrentLocale(defaultBroswerLanguage); // Default to English if no cookie or cache
		setIsLoadedCache(true);
	}, [
		languageCache,
		getCookie,
		setCookie,
		setLanguageCache,
		defaultBroswerLanguage,
	]);

	const getLanguageData = useCallback(
		async (locale: string) => {
			locale = locale.replaceAll(/["\\]/g, '');
			try {
				const res = await fetch(`/locales/${locale}.json`, {
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (!res.ok) {
					throw new Error(`Failed to fetch translations for ${locale}`);
				}
				const data = await res.json();
				setLoadedTranslations(data);
				setCookie('languageCache', locale, 30); // Set cookie for 30 days
				setLanguageCache(locale);
				setLanguageDataCache([locale, data]);
			} catch (error) {
				console.error(`Could not load translations for ${locale}`, error);
			}
		},
		[setCookie, setLanguageCache, setLanguageDataCache],
	);

	useEffect(() => {
		const loadTranslations = async () => {
			if (currentLocale && isLoadedCache) {
				try {
					const savedLang = LanguageDataCache[0] as unknown as string;
					if (
						savedLang === currentLocale &&
						LanguageDataCache[1] !== null &&
						LanguageDataCache[1] !== undefined &&
						Object.keys(LanguageDataCache[1]).length > 0
					) {
						console.log(`Using cached translations for ${currentLocale}`);
						return setLoadedTranslations(
							LanguageDataCache[1] as unknown as Messages,
						);
					}
					console.log(`Loading translations for ${currentLocale}`);
					getLanguageData(currentLocale);
				} catch (error) {
					console.error(
						`Could not load translations for ${currentLocale}`,
						error,
					);
					getLanguageData(defaultBroswerLanguage);
				}
			}
		};
		loadTranslations();
	}, [
		currentLocale,
		LanguageDataCache,
		getLanguageData,
		isLoadedCache,
		defaultBroswerLanguage,
	]);

	const translate = (key: string): string => {
		const keys = key.split('.');
		let result: string | Messages | undefined = loadedTranslations;
		for (const k of keys) {
			if (result && typeof result === 'object' && k in result) {
				result = result[k];
			} else {
				return key;
			}
		}
		return typeof result === 'string' ? result : key;
	};

	const handleSetLocale = (newLocale: string) => {
		setCurrentLocale(newLocale);
	};

	return (
		<LanguageContext.Provider
			value={{
				locale: currentLocale,
				setLocale: handleSetLocale,
				translations: loadedTranslations,
				t: translate,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export const useTranslation = (): LanguageContextType => {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error('useTranslation must be used within a LanguageProvider');
	}
	return context;
};
