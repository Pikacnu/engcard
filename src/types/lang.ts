export enum LangEnum {
	EN = 'en',
	TW = 'tw',
}

export type Lang = `${LangEnum}`;

export const Langs = Object.values(LangEnum);

export const LangCodeToName = (lang: LangEnum) =>
	({
		[LangEnum.EN]: 'English',
		[LangEnum.TW]: '繁體中文',
	}[lang] || 'Unknown');
