export type Lang = 'en' | 'tw';

export type CardProps = {
	word: string;
	phonetic: string;
	blocks: Blocks[];
	flipped?: boolean;
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
	Error = 'error',
}

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
