'use client';

import { useLocalStorage } from '@/hooks/localstorage';
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [cachedTheme, setCachedTheme] = useLocalStorage<Theme | null>(
		'theme',
		null,
		'string',
	);
	const [theme, setThemeState] = useState<Theme>(cachedTheme || 'light'); // Default theme

	useEffect(() => {
		if (!cachedTheme) {
			// Check system preference if no theme is stored
			const prefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)',
			).matches;
			setThemeState(prefersDark ? 'dark' : 'light');
			setCachedTheme(prefersDark ? 'dark' : 'light');
		}
		setThemeState(cachedTheme || 'dark');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// Apply theme to documentElement and save to localStorage
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('theme', theme);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	const toggleTheme = () => {
		setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
