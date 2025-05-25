import { Content, FunctionCall } from '@google/generative-ai';
import { ChatModelSchema } from './utils';
import { Lang } from './types/lang';

export { type Lang, type LangEnum } from './types/lang';

export type CardProps = {
	word: string;
	phonetic: string;
	blocks: Blocks[];
	flipped?: boolean;
	audio?: string;
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
	phonetics: { text: string; audio?: string; sourceUrl: string }[];
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

export type WordsAPIResponse = {
	word: string;
	results: Array<{
		definition: string;
		partOfSpeech: string;
		synonyms: string[];
		typeOf: string[];
		hasTypes: string[];
		examples?: string[];
	}>;
};

export type DeckCollection = {
	userId: string;
	cards: CardProps[];
	name: string;
	isPublic: boolean;
};

export enum CardType {
	Questions,
	Card,
	List,
	Word,
}

export type Deck = {
	name: string;
	isPublic: boolean;
	userId: string;
	cards: CardProps[];
	allows?: string[];
};

export type DeckResponse = {
	_id: string;
	card_length: number;
	name: string;
	isPublic: boolean;
};

export type DeckCardsResponse = Deck & { _id: string };

export type ShareLink = {
	deckId: string;
	isPublic: boolean;
	allows?: string[];
};

export type Word = {
	word: string;
	zh: string[];
	phonetic: string;
	phonetics: Phonetic[];
	blocks: Blocks[];
};

export type WordHistory = {
	userId: string;
	deckId: string;
	words: string[];
	date: Date;
};

export type WithStringId<T> = T & { id: string };

export type WithStringObjectId<T> = T & { _id: string };

// Type for representing a single grammar error identified by the AI
export type GrammarError = {
    message: string; // Description of the error, e.g., "Spelling mistake" or "Subject-verb agreement"
    shortMessage?: string; // A very brief version of the message
    correction?: string; // Suggested correction for the error
    offset: number; // Character offset from the beginning of the text where the error starts
    length: number; // Length of the erroneous text segment
    ruleId?: string; // ID of the grammar rule that was violated (optional)
    ruleDescription?: string; // Description of the rule (optional)
};

export type ChatSession = {
	userId: string;
	history: Array<{
		content: WithStringId<Content>; // User input or AI response text/parts
		action?: ChatModelSchema;       // If AI's response was a structured action
		functionCall?: FunctionCall | undefined; // If AI intends to call a defined function
		grammarCheckResults?: GrammarError[]; // Optional: Results of a grammar check performed by the AI on the *previous* user message, included in the AI's current response history item.
	}>;
	chatName: string;
};

export enum ChatAction {
	AddDeck = 'AddDeck',
	RemoveDeck = 'RemoveDeck',
	EditDeck = 'EditDeck',
	DoNothing = 'DoNothing',
	ShowOuput = 'ShowOuput',
	AddCard = 'AddCard',
	ChangeChatName = 'ChangeChatName',
	GrammarCheck = 'GrammarCheck', // New action
	//Questions = 'Questions',
}

export const ExtenstionTable = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
	['image/gif', 'gif'],
	['image/svg+xml', 'svg'],
]);

export const allowedImageExtension = [
	'jpg',
	'jpeg',
	'png',
	'webp',
	'gif',
	'svg',
];

export const ExtenstionToMimeType = new Map([
	['jpg', 'image/jpeg'],
	['jpeg', 'image/jpeg'],
	['png', 'image/png'],
	['webp', 'image/webp'],
	['gif', 'image/gif'],
	['svg', 'image/svg+xml'],
]);

export type MarkAsNeedReview = {
	word: string;
	count: number;
	userId: string;
};

export type Account = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
	providerAccountId: string;
	provider: string;
	type: string;
	userId: string;
};

export type MarkedWord = {
	userId: string;
	word: string[];
};

export type PublicDeckToUser = {
	userId: string;
	deckId: string[];
};

export enum DeckType {
	AutoChangeToNext,
	ChangeByButton,
}

export enum OCRProcessType {
	OnlyFromImage,
	FromSourceButOnlyDefinitionFromImage,
	FromSource,
}

export type UserSettingsCollection = {
	userId: string;
	deckActionType: DeckType;
	ocrProcessType: OCRProcessType;
};

export type WithAvliable<T> = T & {
	available: boolean;
};

export type EnWordDefinition = {
	definition: string;
	examples?: string[];
	lemmas: Lemma[];
	id: string;
	ili: string;
	pos: string;
	subject: string;
	relations: Relation[];
	gloss: string | null;
};

export type Lemma = {
	lemma: string;
	language: string;
	sense_key: string;
	importance: number;
	pronunciations: Pronunciation[];
	entry_no: number;
};

export type Pronunciation = {
	value: string;
	variety: string | null;
};

export type Relation = {
	src_word: string | null;
	trg_word: string | null;
	rel_type: RelationType;
	target: string;
};

export enum RelationType {
	Hypernym = 'hypernym',
	Hyponym = 'hyponym',
	Meronym = 'meronym',
	Holonym = 'holonym',
	Antonym = 'antonym',
	Synonym = 'synonym',
	Related = 'related',
	Derivation = 'derivation',
	DomainRegion = 'domain_region',
	DomainUsage = 'domain_usage',
	DomainTopic = 'domain_topic',
}

export enum EnWordPartOfSpeech {
	Noun = 'noun',
	Verb = 'verb',
	Adjective = 'adj',
	Error = 'error',
}

export const EnWordPartOfSpeechToPartOfSpeech: Record<
	EnWordPartOfSpeech,
	PartOfSpeech
> = {
	[EnWordPartOfSpeech.Noun]: PartOfSpeech.Noun,
	[EnWordPartOfSpeech.Verb]: PartOfSpeech.Verb,
	[EnWordPartOfSpeech.Adjective]: PartOfSpeech.Adjective,
	[EnWordPartOfSpeech.Error]: PartOfSpeech.Error,
};

// Represents a fill-in-the-blank question generated by the AI
export type FillInTheBlankQuestion = {
    _id?: string; // Database ID, usually ObjectId as string
    userId: string; // ID of the user who generated/owns this question
    sourceWord: string; // The original word(s) provided by the user to generate the question
    originalSentence: string; // The complete sentence before blanking
    blankedSentence: string; // The sentence with one or more blanks (e.g., using '____')
    correctWord: string; // The word that correctly fills the blank
    options?: string[]; // Optional: For multiple-choice style, includes the correctWord plus distractors
    difficulty?: 'easy' | 'medium' | 'hard'; // Optional: Estimated difficulty level
    createdAt?: Date; // Timestamp of when the question was created
    // You might also consider adding a field for the AI model used, or a version number for the question structure.
};
