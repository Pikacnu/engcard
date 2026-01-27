import { PartOfSpeech } from '@/type';

export interface MoeDefinition {
  def: string;
  antonyms?: string;
  example?: string[];
  quote?: string[];
  synonyms?: string;
  type?: string;
}

export interface MoeHeteronym {
  bopomofo: string;
  bopomofo2?: string;
  definitions: MoeDefinition[];
  pinyin: string;
}

export interface MoeResponse {
  heteronyms: MoeHeteronym[];
  non_radical_stroke_count?: number;
  radical?: string;
  stroke_count?: number;
  title: string;
}

export type ZhPartOfSpeech =
  | '副'
  | '動'
  | '名'
  | '形'
  | '量'
  | '代'
  | '介'
  | '連'
  | '嘆'
  | '感'
  | '縮'
  | '片';

export enum ZhPartOfSpeechEnum {
  Adverb = '副',
  Verb = '動',
  Noun = '名',
  Adjective = '形',
  Numeral = '量',
  Pronoun = '代',
  Preposition = '介',
  Conjunction = '連',
  Interjection = '嘆',
  Exclamation = '感',
  Abbreviation = '縮',
  Phrase = '片',
}

export const ZhPartOfSpeechMap: Record<ZhPartOfSpeech, PartOfSpeech> = {
  [ZhPartOfSpeechEnum.Adverb]: PartOfSpeech.Adverb,
  [ZhPartOfSpeechEnum.Verb]: PartOfSpeech.Verb,
  [ZhPartOfSpeechEnum.Noun]: PartOfSpeech.Noun,
  [ZhPartOfSpeechEnum.Adjective]: PartOfSpeech.Adjective,
  [ZhPartOfSpeechEnum.Numeral]: PartOfSpeech.Noun,
  [ZhPartOfSpeechEnum.Pronoun]: PartOfSpeech.Pronoun,
  [ZhPartOfSpeechEnum.Preposition]: PartOfSpeech.Preposition,
  [ZhPartOfSpeechEnum.Conjunction]: PartOfSpeech.Conjunction,
  [ZhPartOfSpeechEnum.Interjection]: PartOfSpeech.Interjection,
  [ZhPartOfSpeechEnum.Exclamation]: PartOfSpeech.Exclamation,
  [ZhPartOfSpeechEnum.Abbreviation]: PartOfSpeech.Abbreviation,
  [ZhPartOfSpeechEnum.Phrase]: PartOfSpeech.Phrase,
};
