import en from '@/locales/en.json';
import zhTw from '@/locales/zh-TW.json';

export function createTranslator(
	lang: string,
): (text: string) => Promise<string> {
	const translations = {
		en: en,
		'zh-TW': zhTw,
	};

	return async (text: string) => {
		const keys = text.split('.');
		let result: string | object | undefined =
			translations[lang as keyof typeof translations];
		for (const k of keys) {
			if (result && typeof result === 'object' && k in result) {
				result = result[k as keyof typeof result];
			} else {
				return text; // Return key if not found
			}
		}
		return typeof result === 'string' ? result : text;
	};
}
