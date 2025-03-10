export type Lang = 'en' | 'tw';
export type LangEnum = { [key in Lang]: string };

export type CardProps = {
	word: string;
	phonetic: string;
	blocks: Blocks[];
	flipped?: boolean;
};

export type Phonetic = {
	text: string;
	audio?: string;
	license?: {
		name: string;
		url: string;
	};
};

export enum PartOfSpeech {
	Noun = 'noun',
	Verb = 'verb',
	Adjective = 'adjective',
	Adverb = 'adverb',
	Pronoun = 'pronoun',
	Preposition = 'preposition',
	Conjunction = 'conjunction',
	Interjection = 'interjection',
	Exclamation = 'exclamation',
	Abbreviation = 'abbreviation',
	Phrase = 'phrase',
	Error = 'error',
}

export const PartOfSpeechShort: { [key in PartOfSpeech]: string } = {
	[PartOfSpeech.Noun]: 'n.',
	[PartOfSpeech.Verb]: 'v.',
	[PartOfSpeech.Adjective]: 'adj.',
	[PartOfSpeech.Adverb]: 'adv.',
	[PartOfSpeech.Pronoun]: 'pron.',
	[PartOfSpeech.Preposition]: 'prep.',
	[PartOfSpeech.Conjunction]: 'conj.',
	[PartOfSpeech.Interjection]: 'interj.',
	[PartOfSpeech.Exclamation]: 'excl.',
	[PartOfSpeech.Abbreviation]: 'abbr.',
	[PartOfSpeech.Phrase]: 'phr.',
	[PartOfSpeech.Error]: 'error',
};

export type Blocks = {
	partOfSpeech?: PartOfSpeech;
	definitions: Definition[];
	phonetic?: string;
};

export type Definition = {
	definition: DefinitionData[];
	example?: Example[][];
	synonyms?: string[];
	antonyms?: string[];
};

export type DefinitionData = {
	lang: Lang;
	content: string;
};

export type Example = {
	lang: Lang;
	content: string;
};

export enum LoginMethod {
	Discord = 'discord',
	Google = 'google',
}

export enum PopUpType {
	Error,
	Info,
	Success,
	Warning,
}

export type PopUp = {
	type: PopUpType;
	message: string;
	show?: boolean;
};

export type DictionaryAPIData = {
	word: string;
	phonetic: string;
	phonetics: { text: string; audio?: string }[];
	orign: string;
	meanings: Array<{
		partOfSpeech: string;
		definitions: Array<{
			definition: string;
			example?: string;
			synonyms: string[];
			antonyms: string[];
		}>;
	}>;
};

export type DeckCollection = {
	userId: string;
	cards: CardProps[];
	name: string;
	isPublic: boolean;
};
