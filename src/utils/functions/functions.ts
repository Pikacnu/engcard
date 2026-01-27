import { LangEnum } from '@/type';

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function isChinese(str: string): boolean {
  return /^[\u4E00-\u9FA5\uF900-\uFA2D\s]+$/.test(str);
}

export function isTraditionalChinese(str: string): boolean {
  const validChars = /^[\u4E00-\u9FFF\s]+$/;
  const hasExtension = /[\u3400-\u4DBF\u{20000}-\u{2A6DF}]/u.test(str);
  return validChars.test(str) && !hasExtension;
}

export function isHavingSpace(str: string): boolean {
  return /\s/.test(str);
}
export function isJapanese(str: string): boolean {
  return /[ぁ-ゔゞァ-・ヽヾ゛゜ー一-龯,.'"\-]/.test(str);
}

export function isEnglish(str: string): boolean {
  return /^[a-zA-Z\s\d,.'"\-]+$/.test(str);
}

export const LangEnumToValidator: Record<LangEnum, (value: string) => boolean> =
  {
    [LangEnum.EN]: (value: string) => isEnglish(value),
    [LangEnum.TW]: (value: string) => isTraditionalChinese(value),
    [LangEnum.JA]: (value: string) => isJapanese(value),
  };

// create a function that only return true if the value is valid for the given lang and not valid for other langs

export const LangVailderCreator =
  (lang: LangEnum): ((value: string) => boolean) =>
  (value: string) =>
    LangEnumToValidator[lang](value) &&
    !Object.entries(LangEnumToValidator)
      .filter(([currentLang]) => currentLang !== lang)
      .some(([, validator]) => validator(value));

export const MultipleLangValidator = (
  langs: LangEnum[],
): ((value: string) => boolean) => {
  const acceptsLanguageValidators = langs.map(
    (lang) => LangEnumToValidator[lang],
  );
  return (value: string) =>
    acceptsLanguageValidators.some((validator) => validator(value));
};

export const getLangByStr = (str: string): LangEnum | null => {
  const entries = Object.entries(LangEnumToValidator);
  for (const [lang, validator] of entries) {
    if (validator(str)) {
      return lang as LangEnum;
    }
  }
  return null;
};
