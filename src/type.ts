import { Lang, LangEnum } from './utils/lang';

// Export shared types moved to break circular dependency
export * from './type-shared';
// Export Drizzle inferred types
export type { UserSettings, UserSettingsCollection } from '@/db/schema';

// Re-export specific utils used elsewhere
export { type Lang, LangEnum } from './utils/lang';

import { Blocks, PartOfSpeech } from './type-shared';

export type CardProps = {
  word: string;
  phonetic: string;
  blocks: Blocks[];
  flipped?: boolean;
  audio?: string;
  availableSearchTarget?: string[];
};

export type Phonetic = {
  text: string;
  audio?: string;
  license?: {
    name: string;
    url: string;
  };
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
  id: string;
  cardInfo: {
    length: number;
    langs: Lang[];
  };
  name: string;
  isPublic: boolean;
};

export type DeckCardsResponse = Deck & { _id: string };

export type ShareLink = {
  deckId: string;
  isPublic: boolean;
  allows?: string[];
};

export type WordHistory = {
  userId: string;
  deckId: string;
  words: string[];
  date: Date;
};

export type WordCollection = {
  available: boolean;
  word: string;
  sourceLang: LangEnum[];
  targetLang: LangEnum;
} & Partial<
  CardProps & {
    availableSearchTarget: string[];
  }
>;

export type WordCollectionWith<T> = T &
  Pick<WordCollection, 'available' | 'word' | 'sourceLang' | 'targetLang'>;

export type WithStringObjectId<T> = T & { _id: string };

export enum ChatAction {
  AddDeck = 'AddDeck',
  RemoveDeck = 'RemoveDeck',
  EditDeck = 'EditDeck',
  DoNothing = 'DoNothing',
  ShowOuput = 'ShowOuput',
  AddCard = 'AddCard',
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

export type MarkWordData = {
  word: string;
  deckId: string;
};

export type MarkAsNeedReview = {
  word: MarkWordData[];
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

export enum ListAdditionButtonIcon {
  Delete,
}
