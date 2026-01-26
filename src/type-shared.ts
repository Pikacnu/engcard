import { Content, FunctionCall } from '@google/genai';
import { ChatModelSchema } from './utils';
import { Lang } from './utils/lang';

export { type Lang, LangEnum } from './utils/lang';

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

export type DefinitionData = {
  lang: Lang;
  content: string;
};

export type Example = {
  lang: Lang;
  content: string;
};

export type Definition = {
  definition: DefinitionData[];
  example?: Example[][];
  synonyms?: string[];
  antonyms?: string[];
};

export type Blocks = {
  partOfSpeech?: PartOfSpeech;
  definitions: Definition[];
  phonetic?: string;
};

export type WithStringId<T> = T & { id: string };

export type ChatSession = {
  userId: string;
  history: Array<{
    content: WithStringId<Content>;
    action?: ChatModelSchema;
    functionCall?: FunctionCall | undefined;
    grammerFix?: {
      offsetWords: number;
      lengthWords: number;
      correctedText: string;
    }[];
  }>;
  chatName: string;
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
