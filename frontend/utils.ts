export interface PhraseDetail {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: Japanese[];
  senses: Sense[];
  attribution: Attribution;
}

export interface Details {
  jlpt: string;
  meanings: string[];
}

export interface Japanese {
  word: string;
  reading: string;
}

export interface Sense {
  english_definitions: string[];
  parts_of_speech: string[];
  links: Link[];
  tags: any[];
  restrictions: any[];
  see_also: string[];
  antonyms: any[];
  source: any[];
  info: any[];
  sentences?: any[];
}

export interface Link {
  text: string;
  url: string;
}

export interface Attribution {
  jmdict: boolean;
  jmnedict: boolean;
  dbpedia: string;
}
