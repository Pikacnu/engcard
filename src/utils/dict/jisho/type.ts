export interface JishoMeta {
  status: number;
}

export interface JishoJapanese {
  word?: string;
  reading: string;
}

export interface JishoLink {
  text: string;
  url: string;
}

export interface JishoSense {
  english_definitions: string[];
  parts_of_speech: string[];
  links: JishoLink[];
  tags: string[];
  restrictions: string[];
  see_also: string[];
  antonyms: string[];
  source: unknown[];
  info: string[];
  sentences?: unknown[];
}

export interface JishoAttribution {
  jmdict: boolean;
  jmnedict: boolean;
  dbpedia: string | boolean;
}

export interface JishoData {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: JishoJapanese[];
  senses: JishoSense[];
  attribution: JishoAttribution;
}

export interface JishoResponse {
  meta: JishoMeta;
  data: JishoData[];
}
