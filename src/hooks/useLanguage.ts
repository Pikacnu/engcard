import { useState } from 'react';

export function useBroswerLanguage() {
	const [language] = useState(() => {
		if (typeof window === 'undefined') {
			return 'en'; // Default to English if not in browser
		}
		const lang = navigator.language;
		if (['zh-TW'].includes(lang)) {
			return lang; // Return 'tw' for Traditional Chinese
		}
		return lang.split('-')[0]; // Return the language part before any region code
	});
	return language;
}
