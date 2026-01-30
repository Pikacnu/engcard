import en from 'public/locales/en.json';
import zhTw from 'public/locales/zh-tw.json';
import ja from 'public/locales/ja.json';
import { Lang, LangEnum } from '@/type';

export function createTranslator(
  lang: string,
): (text: string) => Promise<string> {
  const translations: Record<Lang, string | object | undefined> = {
    [LangEnum.EN]: en,
    [LangEnum.TW]: zhTw,
    [LangEnum.JA]: ja,
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
