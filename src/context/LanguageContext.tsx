'use client'; // This context will be used in client components

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import useCookie from '@/hooks/cookie';
import { useLocalStorage } from '@/hooks/localstorage';

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
	const [languageCache, setLanguageCache] = useLocalStorage<string>(
		'languageCache',
		'en',
	);
	const [currentLocale, setCurrentLocale] = useState<string>('en'); // Default locale
	const [loadedTranslations, setLoadedTranslations] = useState<Messages>({});

	useEffect(() => {
		const cookieLocale = getCookie('language');
		if (cookieLocale) {
			setCurrentLocale(cookieLocale);
			setLanguageCache(cookieLocale);
			return;
		}

		setCurrentLocale(languageCache);
	}, [languageCache, getCookie, setCookie, setLanguageCache]);

	useEffect(() => {
		// Load translations when locale changes
		const loadTranslations = async () => {
			if (currentLocale) {
				try {
					const translations = await import(`@/locales/${currentLocale}.json`);
					setLoadedTranslations(translations.default || translations);
				} catch (error) {
					console.error(
						`Could not load translations for ${currentLocale}`,
						error,
					);
					// Fallback to English if current locale's translations are missing
					const fallback = await import(`@/locales/en.json`);
					setLoadedTranslations(fallback.default || fallback);
				}
			}
		};
		loadTranslations();
	}, [currentLocale]);

	const translate = (key: string): string => {
		const keys = key.split('.');
		let result: string | Messages | undefined = loadedTranslations;
		for (const k of keys) {
			if (result && typeof result === 'object' && k in result) {
				result = result[k];
			} else {
				return key; // Return key if not found
			}
		}
		return typeof result === 'string' ? result : key;
	};

	// The setLocale function here is more for future direct locale changes if needed,
	// but primary navigation will be through Next.js router.
	const handleSetLocale = (newLocale: string) => {
		// Actual locale change should be handled by router.push to a new path
		// This is a placeholder if we need to manage locale state directly for some reason
		// For now, it just updates context state, but won't change URL
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
