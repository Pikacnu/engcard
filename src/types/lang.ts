export enum LangEnum {
	EN = 'en',
	TW = 'tw',
}

export type Lang = `${LangEnum}`;

export const Langs = Object.values(LangEnum);
