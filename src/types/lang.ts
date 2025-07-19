export enum LangEnum {
	EN = 'en',
	TW = 'zh-tw',
	JA = 'ja',
}

export type Lang = `${LangEnum}`;

export const Langs = Object.values(LangEnum);

export const LangNames: Record<LangEnum, string> = {
	[LangEnum.EN]: 'English',
	[LangEnum.TW]: '繁體中文',
	[LangEnum.JA]: '日本語',
};

export const LangEnglishNames: Record<LangEnum, string> = {
	[LangEnum.EN]: 'English',
	[LangEnum.TW]: 'Traditional Chinese(Taiwan)',
	[LangEnum.JA]: 'Japanese',
};

export const LangCodeToName = (lang: LangEnum | Lang) =>
	LangNames[lang] || 'Unknown';
